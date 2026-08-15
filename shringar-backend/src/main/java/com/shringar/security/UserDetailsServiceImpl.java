package com.shringar.security;

import com.shringar.model.User;
import com.shringar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("No user found with identifier: " + identifier));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .disabled(!Boolean.TRUE.equals(user.getIsActive()))
                .build();
    }
}
