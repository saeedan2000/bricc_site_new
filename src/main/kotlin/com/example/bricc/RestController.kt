package com.example.bricc

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class RestController(private val config: BriccConfig) {
    @GetMapping("/timings")
    fun timings(): BriccConfig {
        return config
    }
}
