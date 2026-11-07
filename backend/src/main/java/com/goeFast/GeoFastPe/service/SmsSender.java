package com.goeFast.GeoFastPe.service;

public interface SmsSender {

    void send(String phoneE164, String message);
}
