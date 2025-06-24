# 💌 NEKOMAILER API

## Description

**NekoMailer** is an Express.js + Nodemailer-based email API designed to send various email types in a cute, well-formatted theme. Perfect for notifications such as:

- 📢 System announcements / updates
- ✅ Registration and account confirmation
- 🔑 Password resets and account removals

This API is built with security and rate-limiting in mind, supporting multiple HTML templates to fit your email style.

**SDK**: Node.js / Express  
**Pinned**: No  
**Theme Color**: Pink to White

Ideal for Hugging Face Spaces or personal backend usage.

Configuration reference: [Hugging Face Docs](https://huggingface.co/docs/hub/spaces-config-reference)

---

## 📦 Features

- ✅ Send email with strong validation
- 🎨 Support multiple HTML templates (`default`, `announcement`, `registration`)
- 🕐 Request throttling & spam protection
- 🔐 Domain blocking (e.g., `test.com`)
- 🐱 Cute neko-themed content

---

## 🔌 How to Use

### Endpoint:
```
POST /neko-post
```

### Headers:
```
Content-Type: application/json
```

### Body Parameters:

| Field     | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| `to`      | string | ✅       | Target email address                      |
| `subject` | string | ✅       | Subject of the email                      |
| `message` | string | ✅       | Main body message                         |
| `template`| string | ❌       | Email template: `default`, `announcement`, `registration` (default: `default`) |

---

## 💻 Example Request

```bash
curl -X POST https://nekomail.hf.space/neko-post \
  -H "Content-Type: application/json" \
  -d '{
    "to": "example@gmail.com",
    "subject": "Update Notice",
    "message": "The server will go under maintenance today at 23:00 WIB~",
    "template": "announcement"
  }'
```

---

## 🖌️ Template Types

### ✉️ Default
Generic and general-purpose email.

### 📢 Announcement
Banner-styled, clean and styled for update/news emails.

### 🐾 Registration
Used for welcome, password reset, or unregister confirmations. Cute and clear.

---

## ⚠️ Rate Limit & Protections

- Max **15 emails / 15 minutes**
- Gradual delays after 5+ requests from same IP
- Blocked email domains: `example.com`, `test.com`, etc

---

## 👣 Auto Footer

Each email includes the note:

```
Sent with 💌 by @nekochii – https://saweria.co/SennaNetwork
```

---

Need help integrating NekoMailer to your bot, site, or tools? Reach out to **SennaNetwork** 🐾
