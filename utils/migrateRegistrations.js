const Event = require("../models/event.js");
const { v4: uuidv4 } = require('uuid');

async function migrateEventRegistrations() {
    try {
        const events = await Event.find({});
        
        let migratedCount = 0;
        
        for (let event of events) {
            let needsMigration = false;
            const newRegistrations = [];
            
            for (let reg of event.registrations) {
                if (!reg.ticketToken) {
                    needsMigration = true;
                    newRegistrations.push({
                        user: reg.user || reg,
                        ticketToken: uuidv4(),
                        attended: reg.attended || false,
                        checkedInAt: reg.checkedInAt || null
                    });
                } else {
                    newRegistrations.push(reg);
                }
            }
            
            if (needsMigration) {
                event.registrations = newRegistrations;
                await event.save();
                migratedCount++;
            }
        }
        
        if (migratedCount > 0) {
            console.log(`Migrated ${migratedCount} events to new registration format`);
        }
    } catch (error) {
        console.error("Error during registration migration:", error);
    }
}

module.exports = migrateEventRegistrations;
