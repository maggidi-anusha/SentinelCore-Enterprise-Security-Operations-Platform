package com.example.sentinelcore.repository;

import com.example.sentinelcore.entity.Alert;
import com.example.sentinelcore.entity.NotificationRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRuleRepository
        extends JpaRepository<NotificationRule, Long> {

    List<NotificationRule> findBySeverity(Alert.AlertSeverity severity);

    List<NotificationRule> findByEnabledTrue();
}
