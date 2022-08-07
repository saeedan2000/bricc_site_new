package com.asdarr.bricc

import org.springframework.data.annotation.Id
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import org.springframework.data.repository.Repository
import org.springframework.data.repository.query.Param

// Column and Table annotations are used where the naming scheme doesn't match the actual database.
// This is because I decided to use lowercase with underscores in the database to exercise the mind.
@Table("announcements")
data class AnnouncementEntry(
    @Id
    val id: Long,
    val subject: String,
    val body: String,

    @Column("start_date")
    val startDate: String,

    @Column("end_date")
    val endDate: String,
    val date: String
)

interface AnnouncementRepository: Repository<AnnouncementEntry, Long> {
    @Query("SELECT * FROM bricc_schema.announcements AS a WHERE a.start_date <= :today AND a.end_date >= :today")
    fun getAnnouncementsForDate(@Param("today") date: String): List<AnnouncementEntry>
}