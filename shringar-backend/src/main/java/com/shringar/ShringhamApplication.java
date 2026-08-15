package com.shringar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class ShringhamApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShringhamApplication.class, args);
        System.out.println("""
                ╔══════════════════════════════════════╗
                ║   ✦ Shringar — मेहंदी कला Backend    ║
                ║   Server running on port 8080         ║
                ║   API base: http://localhost:8080/api ║
                ╚══════════════════════════════════════╝
                """);
    }
}
