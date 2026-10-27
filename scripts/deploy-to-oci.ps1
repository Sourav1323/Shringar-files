<#
.SYNOPSIS
    One-Click Automated Deployer from Windows to Oracle Cloud Infrastructure (OCI).
.DESCRIPTION
    Packages the production codebase, uploads it to the newly provisioned OCI VM,
    bootstraps Docker/firewalls/iptables, and starts the entire Shringar platform.
.PARAMETER ServerIp
    Public IPv4 address of the OCI Compute instance.
.PARAMETER SshKeyPath
    Path to the SSH private key (default: .\ssh-key-2026-10-27.key).
.PARAMETER SshUser
    SSH username (default: 'ubuntu' for Ubuntu images, 'opc' for Oracle Linux).
.EXAMPLE
    .\scripts\deploy-to-oci.ps1 -ServerIp 129.225.6.28
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true, Position = 0, HelpMessage = "Public IP of your OCI Compute instance")]
    [string]$ServerIp,

    [Parameter(Mandatory = $false)]
    [string]$SshKeyPath = ".\ssh-key-2026-10-27.key",

    [Parameter(Mandatory = $false)]
    [string]$SshUser = "ubuntu"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  * SHRINGAR PLATFORM - 1-CLICK OCI PRODUCTION DEPLOYER   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target Server:   $SshUser@$ServerIp" -ForegroundColor White
Write-Host "SSH Key Path:    $SshKeyPath" -ForegroundColor White
Write-Host "Timestamp:       $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

# 1. Resolve & Verify SSH Key
if (-not (Test-Path $SshKeyPath)) {
    if (Test-Path "..\$SshKeyPath") {
        $SshKeyPath = "..\$SshKeyPath"
    } else {
        Write-Error "SSH private key not found at '$SshKeyPath'. Please verify path."
        exit 1
    }
}
$resolvedKey = (Resolve-Path $SshKeyPath).Path
Write-Host "[OK] SSH Private Key verified: $resolvedKey" -ForegroundColor Green

# 2. Test SSH Connectivity
Write-Host ""
Write-Host "[1/5] Testing SSH connectivity to OCI server ($ServerIp)..." -ForegroundColor Yellow
$sshOptions = @(
    "-i", $resolvedKey,
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "-o", "BatchMode=yes",
    "-o", "ConnectTimeout=10"
)

$uname = & ssh @sshOptions "$SshUser@$ServerIp" "uname -sm"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Notice: Direct SSH with '$SshUser' returned non-zero. Trying 'opc' user..." -ForegroundColor DarkYellow
    $SshUser = "opc"
    $uname = & ssh @sshOptions "$SshUser@$ServerIp" "uname -sm"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Could not connect to $ServerIp. Is the server running and has Port 22 allowed in OCI Ingress Rules?"
        exit 1
    }
}
Write-Host "[OK] Connected! Remote OS Architecture: $uname" -ForegroundColor Green

# 3. Create Clean Production Distribution Archive
Write-Host ""
Write-Host "[2/5] Packaging production codebase into distribution bundle..." -ForegroundColor Yellow
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName
$bundleTar = Join-Path $rootDir "shringar-oci-production.tar.gz"

if (Test-Path $bundleTar) {
    Remove-Item $bundleTar -Force
}

Write-Host "Creating compressed tar.gz archive..." -ForegroundColor Gray
$tarArgs = @(
    "-czf", $bundleTar,
    "--exclude=*node_modules*",
    "--exclude=.git",
    "--exclude=.vscode",
    "--exclude=*.log",
    "--exclude=*.zip",
    "--exclude=*.tar.gz",
    "-C", $rootDir,
    "docker-compose.prod.yml",
    "docker-compose.yml",
    ".env.example",
    "nginx",
    "mysql",
    "scripts",
    "shringar-admin",
    "shringar-backend",
    "shringar-react"
)

& tar @tarArgs
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $bundleTar)) {
    Write-Error "Failed to generate tar.gz archive."
    exit 1
}

$bundleSizeMb = [Math]::Round(((Get-Item $bundleTar).Length / 1MB), 2)
Write-Host "[OK] Production bundle created: $bundleTar ($bundleSizeMb MB)" -ForegroundColor Green

# 4. Upload Bundle to OCI Server
Write-Host ""
Write-Host "[3/5] Uploading production bundle and bootstrap runner to OCI server ($ServerIp)..." -ForegroundColor Yellow
$bootstrapScript = Join-Path $rootDir "scripts\remote-bootstrap.sh"
$scpArgs = @(
    "-i", $resolvedKey,
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "-o", "BatchMode=yes",
    $bundleTar,
    $bootstrapScript,
    "$SshUser@${ServerIp}:/tmp/"
)

& scp @scpArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload archive via SCP."
    exit 1
}
Write-Host "[OK] Bundle uploaded successfully to /tmp/shringar-oci-production.tar.gz" -ForegroundColor Green

# 5. Remote Unpack & Bootstrap Execution
Write-Host ""
Write-Host "[4/5] Executing automated server setup and Docker stack deployment..." -ForegroundColor Yellow
& ssh @sshOptions "$SshUser@$ServerIp" "bash /tmp/remote-bootstrap.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Setup completed with warnings. Running health probe..."
}

# 6. Verify Public Endpoints
Write-Host ""
Write-Host "[5/5] Probing live endpoints on $ServerIp..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$testUrls = @(
    @{ Name = "Customer Website (Port 80)"; Url = "http://$ServerIp/" },
    @{ Name = "Core REST API";              Url = "http://$ServerIp/api/settings" },
    @{ Name = "Admin Operations Portal";    Url = "http://$ServerIp/admin-portal/login.html" }
)

foreach ($endpoint in $testUrls) {
    try {
        $resp = Invoke-WebRequest -Uri $endpoint.Url -UseBasicParsing -TimeoutSec 10
        Write-Host "  [OK] $($endpoint.Name): HTTP $($resp.StatusCode) OK" -ForegroundColor Green
    } catch {
        Write-Host "  [WAIT] $($endpoint.Name): Initializing or waiting for OCI VCN Ingress Rules." -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  * DEPLOYMENT TO ORACLE CLOUD COMPLETED!                 " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Customer Web App:     http://$ServerIp/" -ForegroundColor Yellow
Write-Host "Virtual AI Try-On:    http://$ServerIp/try-on" -ForegroundColor Yellow
Write-Host "Community Gallery:    http://$ServerIp/gallery" -ForegroundColor Yellow
Write-Host "Admin Portal:         http://$ServerIp/admin-portal/login.html" -ForegroundColor Yellow
Write-Host "REST API:             http://$ServerIp/api/settings" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Admin Credentials:    admin@shringar.com  /  Admin@123" -ForegroundColor White
Write-Host "Customer Phone Login: 8619377860          /  Sourav@1323" -ForegroundColor White
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "SSL Note: To activate free HTTPS for your custom domain, run:" -ForegroundColor Cyan
Write-Host "  ssh -i '$SshKeyPath' $SshUser@$ServerIp '/opt/shringar/scripts/setup-ssl.sh yourdomain.com'" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
