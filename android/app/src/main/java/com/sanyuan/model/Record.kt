package com.sanyuan.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "records")
data class Record(
    @PrimaryKey val id: String,
    val date: String,
    val owner: String,
    val address: String,
    val angle: String,
    val yun: Int,
    val mountain: String,
    val shijiao: String,
    val firePit: Boolean,
    val qiXing: Boolean,
    val notes: String,
    val createdAt: String,
    val synced: Boolean = false
)
