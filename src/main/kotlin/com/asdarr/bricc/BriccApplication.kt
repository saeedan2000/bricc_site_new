package com.asdarr.bricc

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(BriccConfig::class)
class BriccApplication

fun main(args: Array<String>) {
	runApplication<BriccApplication>(*args)
}
