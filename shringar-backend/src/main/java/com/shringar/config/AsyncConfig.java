package com.shringar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Notification sending (SMS + 3 emails per confirmed booking) must never make
 * the customer wait on the payment-verification response. All @Async methods
 * in EmailService/SmsService run on this dedicated pool instead of the default
 * SimpleAsyncTaskExecutor, so a slow SMTP/Twilio call can't exhaust request threads.
 */
@Configuration
public class AsyncConfig implements AsyncConfigurer {

    @Override
    @Bean(name = "notificationExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(6);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("shringar-notify-");
        executor.initialize();
        return executor;
    }
}
