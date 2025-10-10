# Custom Domain Guide

## What is Custom Domain?

Custom Domain allows users to access their portfolio using their own domain name instead of the default system URL.

## Default vs Custom Domain

### Default Setup (No Custom Domain)
```
Portfolio URL: http://localhost:5001/portfolio/admin1
- Automatically generated from user's email
- Works immediately, no setup required
- Shareable link
```

### With Custom Domain
```
Primary URL: http://localhost:5001/portfolio/admin1 (always works)
Custom Domain: https://myportfolio.com (if DNS configured)
- User provides their own domain
- Requires DNS configuration
- Professional appearance
```

## How Custom Domain Works

### 1. User Enters Custom Domain
```json
{
  "template": "basic",
  "customDomain": "myportfolio.com",
  "bio": "..."
}
```

### 2. System Validates Domain
- Removes `http://` or `https://` prefix
- Checks for valid domain format (must contain `.`)
- Stores validated domain in database

### 3. System Returns Both URLs
```json
{
  "url": "http://localhost:5001/portfolio/admin1",
  "customDomain": "myportfolio.com",
  "note": "Custom domain requires DNS configuration..."
}
```

## Setup Requirements

### For Users
If you want to use your custom domain:

1. **Own a Domain**
   - Purchase from registrar (GoDaddy, Namecheap, etc.)
   - Example: `myportfolio.com`

2. **Configure DNS**
   ```
   Type: A Record
   Name: @ (or www)
   Value: [SERVER_IP_ADDRESS]
   TTL: 3600
   ```

3. **Wait for Propagation**
   - DNS changes can take 24-48 hours
   - Use [whatsmydns.net](https://www.whatsmydns.net) to check

4. **Contact Support**
   - Get server IP address
   - Request SSL certificate setup (for HTTPS)

### For Administrators

To support custom domains, configure:

1. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name *.resumate.app;
       
       location /portfolio/ {
           proxy_pass http://localhost:5001;
           proxy_set_header Host $host;
       }
   }
   ```

2. **SSL Certificate (Let's Encrypt)**
   ```bash
   certbot --nginx -d myportfolio.com
   ```

3. **Wildcard DNS** (for subdomains)
   ```
   *.resumate.app -> SERVER_IP
   ```

## UI Integration

### In Portfolio Form

```tsx
import { CustomDomainHelp } from "@/components/ui/HelpText";

<div>
  <label>
    Custom Domain (Optional)
    <CustomDomainHelp />
  </label>
  <input 
    type="text"
    placeholder="myportfolio.com"
    {...register("customDomain")}
  />
</div>
```

## API Endpoints

### Check Portfolio
```http
GET /portfolio/check
Authorization: Bearer {token}

Response:
{
  "exists": true,
  "portfolio": {
    "url": "http://localhost:5001/portfolio/admin1",
    "template": "basic",
    "updatedAt": "2025-10-10T..."
  }
}
```

### Save Portfolio with Custom Domain
```http
POST /portfolio/save
Authorization: Bearer {token}
Content-Type: application/json

{
  "template": "basic",
  "customDomain": "myportfolio.com",
  "bio": "..."
}

Response:
{
  "id": "...",
  "username": "admin1",
  "customDomain": "myportfolio.com",
  "generatedUrl": "http://localhost:5001/portfolio/admin1",
  "status": "success",
  "message": "Portfolio created successfully!"
}
```

### Generate URL
```http
POST /portfolio/url
Authorization: Bearer {token}
Content-Type: application/json

{
  "customDomain": "myportfolio.com"
}

Response:
{
  "url": "http://localhost:5001/portfolio/admin1",
  "customDomain": "myportfolio.com",
  "note": "Custom domain requires DNS configuration..."
}
```

## Validation Rules

1. **Domain Format**
   - Must contain at least one dot (`.`)
   - Example: ✅ `myportfolio.com`, ❌ `localhost`

2. **Protocol Removal**
   - `https://myportfolio.com` → `myportfolio.com`
   - `http://myportfolio.com` → `myportfolio.com`

3. **Whitespace**
   - Automatically trimmed
   - `  myportfolio.com  ` → `myportfolio.com`

## Important Notes

⚠️ **Custom domain is optional**
- Users can use the system without custom domain
- Default URL always works

⚠️ **Custom domain requires technical setup**
- Not plug-and-play
- Requires DNS configuration
- May need admin assistance

⚠️ **Primary URL is always backend URL**
- System generates: `http://localhost:5001/portfolio/username`
- This URL always works
- Custom domain is additional

## Future Enhancements

1. **Automatic DNS Verification**
   - Check if domain points to server
   - Show verification status

2. **Subdomain Support**
   - Allow `username.resumate.app`
   - No DNS setup needed

3. **SSL Auto-provisioning**
   - Automatic HTTPS setup
   - Let's Encrypt integration

4. **Domain Status Dashboard**
   - Show DNS status
   - SSL certificate status
   - Domain expiry

