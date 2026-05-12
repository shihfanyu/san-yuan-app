package com.sanyuan.api

import com.sanyuan.model.Record
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

data class SaveRequest(
    val action: String = "save",
    val date: String,
    val owner: String,
    val address: String,
    val angle: String,
    val yun: Int,
    val mountain: String,
    val shijiao: String,
    val firePit: Boolean,
    val qiXing: Boolean,
    val notes: String
)

data class DeleteRequest(val action: String = "delete", val id: String)
data class SaveResponse(val success: Boolean, val id: String? = null, val error: String? = null)
data class ListResponse(val success: Boolean, val records: List<Record>? = null, val error: String? = null)

interface GasApi {
    @GET(".")
    suspend fun listRecords(@Query("action") action: String = "list", @Query("q") q: String = ""): ListResponse

    @POST(".")
    suspend fun saveRecord(@Body body: SaveRequest): SaveResponse

    @POST(".")
    suspend fun deleteRecord(@Body body: DeleteRequest): SaveResponse
}

object GasApiClient {
    // GAS_URL 在 BuildConfig 中設定，或直接改這裡
    private const val GAS_URL = "https://script.google.com/macros/s/AKfycbxtEx31cvlMOrr4o8Go5fwqoyMV73t-GcFgroaSTH-OQ9aHHKG8uixpsKyf-zTQbfLa/exec/"

    val api: GasApi by lazy {
        Retrofit.Builder()
            .baseUrl(GAS_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(GasApi::class.java)
    }
}
