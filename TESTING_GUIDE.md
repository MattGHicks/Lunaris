# 🧪 Lunaris Phase 3 Testing Guide

## Prerequisites

Before testing, ensure you have:
- ✅ PostgreSQL running
- ✅ Node.js 20+ installed
- ✅ Dependencies installed (`npm install`)

## Step 1: Database Setup

### Create Migration for Ship Production

The database schema has been updated with ship storage fields. Apply the migration:

```bash
# Create and apply migration
npx prisma migrate dev --name add_ship_production

# Regenerate Prisma Client (if needed)
npx prisma generate
```

This adds two JSON fields to the `Planet` model:
- `ships` - Stores ship counts (e.g., `{ "lightFighter": 10, "cruiser": 5 }`)
- `shipQueue` - Stores production queue data

## Step 2: Start the Development Server

```bash
# Start the custom server with Socket.io
npm run dev
```

The server will start on `http://localhost:3000`

## Step 3: Create a Test Account

1. Navigate to `http://localhost:3000`
2. Click **Register**
3. Create an account:
   - Username: `testplayer`
   - Email: `test@example.com`
   - Password: (your choice)

Upon registration, you'll automatically get:
- A home planet at random coordinates
- Starting resources: 500 Metal, 300 Crystal, 100 Deuterium
- Starting buildings: Metal Mine L1, Crystal Mine L1, Solar Plant L1

## Step 4: Test Resource Production System

### Verify Resources are Ticking
1. Go to **Overview** page
2. Watch the resource numbers - they should tick up in real-time
3. Check production rates displayed under each resource

### Test Building Upgrades
1. Scroll to the **Buildings** section
2. Try upgrading the Metal Mine (should be affordable)
3. **Observe**:
   - Resources are deducted immediately
   - Countdown timer appears
   - Progress bar fills up
   - Toast notification appears
4. Wait for completion (should be seconds with 100x speed)
5. **Verify**: Building level increases automatically via WebSocket

### Test Building Cancellation
1. Start another building upgrade
2. Click **Cancel** button
3. **Verify**: Resources are refunded 100%

## Step 5: Test Research System

### Build Research Lab First
1. Go to **Buildings** section
2. Find **Research Lab** and upgrade it to Level 1
3. Wait for completion

### Test Research
1. Navigate to **Research** page (top menu)
2. View available technologies
3. Try researching **Energy Technology** (cheapest)
4. **Observe**:
   - Resources deducted
   - Countdown timer starts
   - Progress bar shows completion
5. Try researching another tech simultaneously
6. **Verify**: Error message "Research in progress"

### Test Tech Tree Prerequisites
1. Try researching **Combustion Drive**
2. **Verify**: Shows prerequisite requirements
3. Research **Energy Technology** Level 1 first
4. **Verify**: Combustion Drive becomes available

### Filter Technologies
1. Click filter tabs: **All**, **Basic**, **Advanced**, **Drives**
2. **Verify**: Technologies filter correctly

## Step 6: Test Fleet Production System

### Build Shipyard
1. Go back to **Overview**
2. Build **Robotics Factory** Level 2 (prerequisite for Shipyard)
3. Wait for completion
4. Build **Shipyard** Level 1
5. Wait for completion

### Research Combustion Drive
1. Go to **Research** page
2. Research **Combustion Drive** Level 1
3. Wait for completion

### Build Ships
1. Navigate to **Shipyard** page
2. You should see available ships (Light Fighter, Small Cargo, etc.)
3. Try building **1 Light Fighter**:
   - Set quantity to 1
   - Click **Build**
4. **Observe**:
   - Production queue appears at top
   - Countdown timer shows remaining time
   - Progress bar fills up
5. Try building another ship
6. **Verify**: Error "Ship production already in progress"

### Test Production Cancellation
1. While ships are building, click **Cancel**
2. **Verify**: Resources refunded 100%

### Test Max Affordable
1. Select **Small Cargo Ship**
2. Click **Max** button
3. **Verify**: Shows maximum quantity you can afford
4. Build multiple ships at once

### Build Different Ship Types
1. Research higher tech levels to unlock more ships:
   - **Heavy Fighter** needs Armor Tech L2, Impulse Drive L2
   - **Cruiser** needs Impulse Drive L4, Ion Tech L2
2. Upgrade Shipyard to unlock advanced ships

## Step 7: Test Fleet Management

### View Fleet
1. After ships finish building, go to **Fleet** page
2. **Verify**: Ships appear in fleet overview
3. **Check summary cards**:
   - Total Ships count
   - Total Cargo Capacity
   - Ship Types count
4. **Check fleet table**:
   - Ship names and counts
   - Cargo capacity per ship
   - Total cargo for each type
   - Speed values

### Real-time Updates
1. Keep Fleet page open
2. In another tab, go to Shipyard and build more ships
3. **Verify**: Fleet page updates automatically when production completes

## Step 8: Test Real-time WebSocket Updates

### Test Multi-Window Sync
1. Open game in **two browser windows** (or incognito + normal)
2. Log in to same account in both
3. In Window 1: Start a building upgrade
4. In Window 2: **Verify** the upgrade appears immediately
5. Test with research and ship production too

### Test Completion Detection
1. Start a building/research/ship with short duration
2. Navigate away from the page
3. Come back after it should be done
4. **Verify**: Completion happens automatically within 5 seconds

## Step 9: Test 100x Speed Mode

Since `GAME_SETTINGS.UNIVERSE_SPEED = 100`:
- Buildings complete in seconds instead of hours
- Research completes very quickly
- Ship production is rapid

**Example Timings at 100x speed**:
- Metal Mine upgrade: ~2-10 seconds
- Energy Technology: ~5 seconds
- Light Fighter: ~1-3 seconds each

## Step 10: Test Planet Reset (Dev Tool)

### Reset Your Planet
1. Click **Reset** button in header (yellow button)
2. Confirm the warning
3. **Verify**:
   - All buildings reset to level 1
   - Resources reset to 500/300/100
   - Page reloads automatically
4. This is useful for testing from scratch

## Common Issues and Solutions

### Resources Not Ticking
- **Check**: WebSocket connection in browser console
- **Solution**: Restart dev server

### Buildings/Research Not Completing
- **Check**: Background completion checker is running
- **Look for**: Console logs showing completion checks
- **Solution**: Refresh the page

### Ships Not Appearing in Fleet
- **Check**: Ship production actually completed
- **Check**: Database has ships field populated
- **Solution**: Check browser console for errors

### Prerequisites Not Met
- **Remember**: Building order matters
  1. Build Robotics Factory first
  2. Then Shipyard
  3. Then Research Lab
- **Remember**: Research Energy Tech before Combustion Drive

### WebSocket Not Connecting
- **Check**: Custom server is running (not standard Next.js dev)
- **Check**: Port 3000 is not blocked
- **Solution**: Restart with `npm run dev`

## Testing Checklist

- [ ] Resources tick up automatically
- [ ] Building upgrades work and complete
- [ ] Building cancellation refunds resources
- [ ] Research works with prerequisites
- [ ] Only one research at a time
- [ ] Research cancellation works
- [ ] Shipyard requires Robotics Factory L2
- [ ] Ships require research prerequisites
- [ ] Only one ship production at a time
- [ ] Ship production completes and adds to fleet
- [ ] Fleet page shows all ships
- [ ] Fleet updates when ships are built
- [ ] WebSocket updates work across tabs
- [ ] Reset button works
- [ ] Navigation works between all pages

## Success Criteria

If all of the above work, **Phase 3 is successful**! You have:
- ✅ Fully functional resource production
- ✅ Building upgrade system with real-time updates
- ✅ Complete research tech tree (17 technologies)
- ✅ Ship production system (13 ship types)
- ✅ Fleet management with statistics
- ✅ Zero-polling WebSocket architecture
- ✅ Automatic completion detection

## Next Steps After Testing

Once testing is successful:
1. **Phase 4**: Fleet missions (send ships between planets)
2. **Phase 4**: Combat system with battle reports
3. **Phase 4**: Espionage missions with probes
4. **Phase 5**: Alliance system and social features

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check terminal for server errors
3. Verify database connection
4. Check Prisma schema matches database
5. Try `npx prisma db push` to sync schema

**Happy Testing!** 🚀
