# 🚀 Quick Start - Testing Phase 3

## TL;DR - Start Testing in 3 Steps

```bash
# 1. Apply database migration
npx prisma migrate dev --name add_ship_production

# 2. Start the server
npm run dev

# 3. Open browser
open http://localhost:3000
```

## What to Test

### ✅ Immediate Tests (No Prerequisites)
1. **Register** a new account
2. **Watch resources** tick up automatically
3. **Upgrade buildings** (Metal Mine, Crystal Mine)
4. **Cancel upgrades** to verify refunds

### ✅ After 30 Seconds
4. Build **Research Lab Level 1**
5. Go to **Research** page
6. Research **Energy Technology**
7. Research **Combustion Drive**

### ✅ After 1 Minute
8. Build **Robotics Factory Level 2**
9. Build **Shipyard Level 1**
10. Go to **Shipyard** page
11. Build **Light Fighters**

### ✅ After 2 Minutes
12. Go to **Fleet** page
13. See your ships!
14. Check total cargo capacity

## Navigation

- **Overview** → `/game` - Resources & Buildings
- **Research** → `/game/research` - Tech Tree
- **Shipyard** → `/game/shipyard` - Build Ships
- **Fleet** → `/game/fleet` - View Your Fleet

## Quick Reference

### Building Prerequisites
- **Shipyard** needs **Robotics Factory L2**
- **Research Lab** needs nothing (build immediately)

### Research Prerequisites
- **Combustion Drive** needs **Energy Technology L1**
- Most ships need **Combustion Drive L1**

### First Ships You Can Build
1. **Light Fighter** - Combustion Drive L1
2. **Small Cargo** - Combustion Drive L2
3. **Espionage Probe** - Combustion Drive L3, Espionage Tech L2

## Troubleshooting

### Database Error
```bash
# If migration fails, reset database
npx prisma migrate reset
```

### WebSocket Not Working
- Check custom server is running (not standard Next.js)
- Restart: `npm run dev`

### Ships Not Appearing
- Check ship production completed
- Refresh Fleet page

## Key Features to Test

✅ **Real-time Updates** - Resources tick, timers countdown
✅ **WebSocket Sync** - Open two tabs, changes appear in both
✅ **100% Refunds** - Cancel anything, get resources back
✅ **Prerequisites** - Can't build without requirements
✅ **Queue System** - One building/research/ship at a time

## Success = All Green Checkmarks! ✅

---

**Full Testing Guide**: See `TESTING_GUIDE.md`
**Complete Summary**: See `PHASE3_SUMMARY.md`
