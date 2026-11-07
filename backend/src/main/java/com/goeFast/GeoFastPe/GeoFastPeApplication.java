package com.goeFast.GeoFastPe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class GeoFastPeApplication {

	public static void main(String[] args) {
		SpringApplication.run(GeoFastPeApplication.class, args);
	}

}
