package com.asdarr.bricc

import org.springframework.stereotype.Service
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

data class Announcement(
    val subject: String,
    val body: String
)

data class InitInfo(
    val maxNumHours: Int,
    val defaultNumHours: Int,
    val announcements: List<Announcement>
)

@Service
class InitService(
    private val config: BriccConfig,
    private val announcementRepo: AnnouncementRepository
    ) {
    fun getInitInfo(): InitInfo {
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val todaysDate = ZonedDateTime.now(ZoneId.of("America/Los_Angeles")).format(formatter)

        return InitInfo(
            maxNumHours = config.maxNumHours,
            defaultNumHours = config.defaultNumHours,
            announcements = announcementRepo.getAnnouncementsForDate(todaysDate).map {
                Announcement(
                    subject = it.subject,
                    body = it.body
                )
            }
        )
    }
}