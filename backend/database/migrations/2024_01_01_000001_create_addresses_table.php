<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('label')->default('Rumah'); // 'Rumah', 'Kantor', 'Toko'
            $table->string('recipient_name');
            $table->string('phone_number', 25);
            $table->text('street_address');
            $table->string('subdistrict')->nullable(); // Kelurahan
            $table->string('district')->nullable(); // Kecamatan
            $table->string('city')->index();
            $table->string('province')->index();
            $table->string('postal_code', 10);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
