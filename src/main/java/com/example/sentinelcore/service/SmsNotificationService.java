package com.example.sentinelcore.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsNotificationService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhone;

    public void sendAlertSms(
            String to,
            String assetName,
            String severity,
            String alertMessage) {

        System.out.println("=== SMS NOTIFICATION TRIGGERED ===");
        System.out.println("Asset: " + assetName);
        System.out.println("Severity: " + severity);

        Twilio.init(accountSid, authToken);

        /*
         * Trial accounts cannot send arbitrary SMS bodies.
         * Twilio expects one of its predefined template names.
         */
        String trialTemplate = "sms_internal_alerts";

        Message message = Message.creator(
                new PhoneNumber(to),
                new PhoneNumber(fromPhone),
                trialTemplate
        ).create();

        System.out.println("SMS REQUEST ACCEPTED");
        System.out.println("Message SID: " + message.getSid());
        System.out.println("Status: " + message.getStatus());
    }
}