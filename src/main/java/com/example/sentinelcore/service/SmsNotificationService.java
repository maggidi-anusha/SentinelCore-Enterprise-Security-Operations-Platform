package com.example.sentinelcore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

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
            String alertMessage) throws Exception {

        System.out.println("=== SMS NOTIFICATION TRIGGERED ===");
        System.out.println("Asset: " + assetName);
        System.out.println("Severity: " + severity);
        System.out.println("SMS Receiver: " + to);

        String url =
                "https://api.twilio.com/2010-04-01/Accounts/"
                        + accountSid
                        + "/Messages.json";

        /*
         * Twilio Trial SMS request
         *
         * To   -> Verified receiver number
         * From -> Twilio trial phone number
         * Body -> Twilio predefined trial template
         */
        String body =
                "To=" + URLEncoder.encode(
                        to,
                        StandardCharsets.UTF_8
                )
                        + "&From=" + URLEncoder.encode(
                        fromPhone,
                        StandardCharsets.UTF_8
                )
                        + "&Body=" + URLEncoder.encode(
                        "sms_internal_alerts",
                        StandardCharsets.UTF_8
                );

        String credentials =
                accountSid + ":" + authToken;

        String basicAuth =
                Base64.getEncoder()
                        .encodeToString(
                                credentials.getBytes(
                                        StandardCharsets.UTF_8
                                )
                        );

        HttpRequest request =
                HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header(
                                "Authorization",
                                "Basic " + basicAuth
                        )
                        .header(
                                "Content-Type",
                                "application/x-www-form-urlencoded"
                        )
                        .POST(
                                HttpRequest.BodyPublishers
                                        .ofString(body)
                        )
                        .build();

        HttpClient client =
                HttpClient.newHttpClient();

        HttpResponse<String> response =
                client.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

        System.out.println(
                "Twilio HTTP Status: "
                        + response.statusCode()
        );

        if (response.statusCode() >= 200
                && response.statusCode() < 300) {

            System.out.println(
                    "=== SMS REQUEST ACCEPTED BY TWILIO ==="
            );

        } else {

            System.err.println(
                    "Twilio SMS failed: "
                            + response.body()
            );

            throw new RuntimeException(
                    "Twilio SMS request failed with status "
                            + response.statusCode()
            );
        }
    }
}