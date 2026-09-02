# S3 & Cloud Storage Setup, Mocking, and Provisioning Guide

This guide covers configuring AWS S3 (or S3-compatible storage like MinIO, Cloudflare R2) in CMCC-AJK, mocking storage locally during testing/development, and provisioning buckets online.

---

## 🏗️ 1. Laravel Storage Configuration

In CMCC-AJK, file attachments (complaint evidence, investigation reports) are managed using Laravel's Filesystem abstraction (`Storage`).

The disk configuration is defined in [`config/filesystems.php`](file:///Users/sheraz/work/cms-ajk/config/filesystems.php):

```php
'complaint_attachments' => [
    'driver' => env('ATTACHMENTS_DISK_DRIVER', 's3'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'bucket' => env('AWS_BUCKET', 'cmcc-ajk-attachments'),
    'url' => env('AWS_URL'),
    'endpoint' => env('AWS_ENDPOINT'),
    'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
    'visibility' => 'private',
    'throw' => true,
],
```

---

## 🧪 2. Mocking S3 Storage Locally

### Method A: In PHPUnit / Feature Tests (`Storage::fake`)
Never connect to live S3 during automated tests. Use Laravel's built-in memory/file fake:

```php
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ComplaintAttachmentTest extends TestCase
{
    public function test_citizen_can_upload_complaint_attachment(): void
    {
        // Fake S3 storage disk in memory
        Storage::fake('s3');

        $file = UploadedFile::fake()->create('evidence.pdf', 1024, 'application/pdf');

        $response = $this->post('/api/complaints/1/attachments', [
            'file' => $file,
        ]);

        // Assert file was uploaded to the mocked s3 disk
        Storage::disk('s3')->assertExists('attachments/' . $file->hashName());
    }
}
```

---

### Method B: Local MinIO S3 Emulator (Docker Container)
To test true S3 API calls locally without an AWS account, run **MinIO**:

#### 1. Add MinIO to `docker-compose.yml` or run via Docker CLI:
```bash
docker run -d \
  --name cmcc-minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

#### 2. Update `.env` for Local MinIO:
```env
FILESYSTEM_DISK=s3
ATTACHMENTS_DISK_DRIVER=s3

AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=cmcc-ajk-attachments
AWS_ENDPOINT=http://127.0.0.1:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

Open `http://localhost:9001` in your browser to access the MinIO Web Console and create the `cmcc-ajk-attachments` bucket.

---

## ☁️ 3. Online Provisioning (AWS CLI / Cloud Storage)

### Option A: AWS CLI Bucket Creation
```bash
# 1. Create S3 Bucket (us-east-1)
aws s3api create-bucket \
  --bucket cmcc-ajk-attachments \
  --region us-east-1

# 2. Block all public access (Sensitive Citizen Evidence)
aws s3api put-public-access-block \
  --bucket cmcc-ajk-attachments \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 3. Enable AES-256 Server-Side Encryption
aws s3api put-bucket-encryption \
  --bucket cmcc-ajk-attachments \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### Option B: Cloudflare R2 / S3-Compatible Setup
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<your-r2-access-key>
AWS_SECRET_ACCESS_KEY=<your-r2-secret-key>
AWS_DEFAULT_REGION=auto
AWS_BUCKET=cmcc-ajk-attachments
AWS_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_USE_PATH_STYLE_ENDPOINT=false
```

---

## 🔐 4. Secure File Access Patterns (Presigned URLs)

Because complaint attachments contain sensitive citizen documents, buckets must remain **private**. Do not generate public URLs.

Generate **temporary presigned URLs** (valid for 15 minutes) for authorized officers:

```php
use App\Models\ComplaintAttachment;
use Illuminate\Support\Facades\Storage;

public function download(ComplaintAttachment $attachment)
{
    // Authorize user via ComplaintPolicy
    $this->authorize('view', $attachment->complaint);

    // Generate 15-minute temporary presigned S3 download URL
    $temporaryUrl = Storage::disk('s3')->temporaryUrl(
        $attachment->file_path,
        now()->addMinutes(15)
    );

    return redirect()->away($temporaryUrl);
}
```
