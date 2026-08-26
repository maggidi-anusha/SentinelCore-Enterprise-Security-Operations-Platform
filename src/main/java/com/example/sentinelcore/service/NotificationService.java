package com.example.sentinelcore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendAlertEmail(
            String to,
            String assetName,
            String severity,
            String message) {

        System.out.println("Entering sendAlertEmail()");
        System.out.println("Sending email to: " + to);

        SimpleMailMessage email = new SimpleMailMessage();

        email.setFrom(fromEmail);
        email.setTo(to);
        email.setSubject(
                "SentinelCore Security Alert - " + severity
        );

        email.setText(
                "Asset: " + assetName +
                        "\nSeverity: " + severity +
                        "\nMessage: " + message
        );

        System.out.println("Calling Gmail SMTP...");

        mailSender.send(email);

        System.out.println("EMAIL SENT SUCCESSFULLY");
    }
}