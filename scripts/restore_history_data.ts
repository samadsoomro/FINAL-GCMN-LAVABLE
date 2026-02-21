
import { storage } from '../server/db-storage.ts';

async function restoreData() {
    console.log("Restoring History Data...");

    // 1. Update Page Header
    await storage.updateHistoryPage(
        "History of GCFM",
        "A legacy of academic excellence spanning over seven decades."
    );
    console.log("Restored Page Header");

    // 2. Clear old sections (simulated by just adding new ones for now, as delete all isn't exposed easily)
    // Actually, let's just add the 3 specific sections.

    // Establishment
    await storage.upsertHistorySection({
        title: 'Establishment',
        description: 'The institution was established in 1953. It has the distinction of being one of the oldest and most prestigious educational institutions in Karachi.',
        iconName: 'Calendar',
        layoutType: 'grid',
        displayOrder: 1
    });

    // Academic Excellence
    await storage.upsertHistorySection({
        title: 'Academic Excellence',
        description: 'Over the years, the institution has produced countless leaders. The college is renowned for its strong emphasis on both academic rigor and character building.',
        iconName: 'Award',
        layoutType: 'grid',
        displayOrder: 2
    });

    // Our Library
    await storage.upsertHistorySection({
        title: 'Our Library',
        description: 'The college library has been a cornerstone of knowledge since the beginning. It houses a vast collection of books, including rare manuscripts.',
        iconName: 'BookOpen',
        layoutType: 'full',
        displayOrder: 3
    });

    console.log("Restored 3 Default Sections");
    process.exit(0);
}

restoreData();
