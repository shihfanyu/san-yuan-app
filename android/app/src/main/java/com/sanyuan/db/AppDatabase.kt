package com.sanyuan.db

import android.content.Context
import androidx.room.*
import com.sanyuan.model.Record
import kotlinx.coroutines.flow.Flow

@Dao
interface RecordDao {
    @Query("SELECT * FROM records ORDER BY createdAt DESC")
    fun getAll(): Flow<List<Record>>

    @Query("""
        SELECT * FROM records
        WHERE (:q = '' OR owner LIKE '%' || :q || '%' OR address LIKE '%' || :q || '%')
        ORDER BY createdAt DESC
    """)
    suspend fun search(q: String): List<Record>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: Record)

    @Delete
    suspend fun delete(record: Record)

    @Query("SELECT * FROM records WHERE synced = 0")
    suspend fun getUnsynced(): List<Record>

    @Query("UPDATE records SET synced = 1 WHERE id = :id")
    suspend fun markSynced(id: String)
}

@Database(entities = [Record::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun recordDao(): RecordDao

    companion object {
        @Volatile private var instance: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "sanyuan.db"
                ).build().also { instance = it }
            }
        }
    }
}
