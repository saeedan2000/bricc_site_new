package com.asdarr.bricc

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties(prefix = "bricc.config")
data class BriccConfig(
    val maxNumHours: Int,
    val defaultNumHours: Int
)
