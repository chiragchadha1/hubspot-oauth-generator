# 🚀 OAuth Backend Generator for HubSpot

Generate production-ready TypeScript OAuth 2.0 backends for HubSpot integrations in seconds.

## ✨ Features

- 🎯 **Multi-Platform** - Deploy to Vercel or Supabase
- 💎 **TypeScript First** - Full type safety throughout
- 🎨 **Beautiful CLI** - React Ink interactive interface
- 🗄️ **Flexible Databases** - PostgreSQL, Vercel Postgres, or Supabase
- 🔐 **Security Built-in** - HubSpot signature validation (v3, v2, v1)
- ⚡ **Auto Token Refresh** - Smart token management
- 📦 **Modular** - Choose only what you need

## 🎬 Quick Start

```bash
npm install
npm start
```

The CLI will guide you through:
1. **Platform** - Vercel or Supabase
2. **Configuration** - Project name and directory
3. **Database** - Choose your database
4. **Features** - Select endpoints to include

## 📦 Generated Structure

### Vercel
```
my-project/
├── api/
│   ├── oauth-install.ts
│   ├── oauth-callback.ts
│   ├── oauth-refresh.ts
│   └── example-api.ts
├── lib/
│   ├── db.ts
│   ├── hubspot-client.ts
│   └── hubspot-signature.ts
├── schema.sql
├── package.json
├── vercel.json
├── .env.example
└── README.md
```

### Supabase
```
my-project/
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── hubspot-client.ts
│   │   │   └── hubspot-signature.ts
│   │   ├── oauth-install/index.ts
│   │   ├── oauth-callback/index.ts
│   │   ├── oauth-refresh/index.ts
│   │   └── example-api/index.ts
│   └── migrations/
│       └── 20250104000000_create_oauth_tables.sql
├── package.json
└── .env.example
```

## 🎯 Features

- ✅ **OAuth Installation Flow** - Redirect users to HubSpot authorization
- ✅ **OAuth Callback Handler** - Exchange codes for tokens
- ✅ **Token Refresh** - Automatic and manual refresh
- ✅ **Example API** - Sample authenticated endpoint
- ✅ **Signature Validation** - Verify HubSpot webhook signatures

## 🔐 Security

- HubSpot signature validation (v3, v2, v1)
- Replay attack prevention (timestamp validation)
- Secure token storage in PostgreSQL
- Environment-based secrets
- Automatic token refresh

## 🚀 Deployment

### Vercel
```bash
cd my-project
npm install
vercel
```

### Supabase
```bash
cd my-project
supabase link --project-ref YOUR_REF
supabase db push
supabase secrets set HUBSPOT_CLIENT_ID="..."
supabase functions deploy
```

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [HubSpot OAuth Docs](https://developers.hubspot.com/docs/api/oauth-quickstart-guide)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Ready to build?** Run `npm start` to generate your backend! 🚀
