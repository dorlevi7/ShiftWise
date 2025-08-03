import { updateAvailabilityStatus } from '../services/availabilityService';

// Generate a unique week key (e.g. week_2025_08_04) based on week offset
export const calculateWeekKey = (weekOffset) => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + weekOffset * 7));
    const formatDate = (date) =>
        `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}`;
    return `week_${formatDate(firstDayOfWeek)}`;
};

// Return a human-readable range string for the selected week
export const calculateWeekRange = (weekOffset) => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + weekOffset * 7));
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return `${formatDate(firstDayOfWeek)} - ${formatDate(lastDayOfWeek)}`;
};

// Handle logic when selecting a Morning or Noon shift (disables previous Night shift)
export const selectMorningOrNoonShift = async (userId, day, updatedAvailability, weekKey, weekOffset, currentCompany) => {
    const previousDay = calculatePreviousDay(day);

    if (day === 'Sunday') {
        const previousWeekKey = calculateWeekKey(weekOffset - 1);
        if (updatedAvailability[userId]?.['Night']?.['Saturday']) {
            await updateAvailabilityStatus(currentCompany, previousWeekKey, userId, 'Night', 'Saturday', 'disabled');
        }
    } else {
        if (updatedAvailability[userId]?.['Night']?.[previousDay]) {
            updatedAvailability[userId]['Night'][previousDay].status = 'disabled';
            await updateAvailabilityStatus(currentCompany, weekKey, userId, 'Night', previousDay, 'disabled');
        }
    }
};

// Handle logic when selecting a Night shift (disables next day's Morning and Noon)
export const selectNightShift = async (userId, day, updatedAvailability, weekKey, weekOffset, currentCompany) => {
    const nextDay = calculateNextDay(day);

    if (day === 'Saturday') {
        const nextWeekKey = calculateWeekKey(weekOffset + 1);
        if (updatedAvailability[userId]?.['Morning']?.['Sunday']) {
            await updateAvailabilityStatus(currentCompany, nextWeekKey, userId, 'Morning', 'Sunday', 'disabled');
        }
        if (updatedAvailability[userId]?.['Noon']?.['Sunday']) {
            await updateAvailabilityStatus(currentCompany, nextWeekKey, userId, 'Noon', 'Sunday', 'disabled');
        }
    } else {
        if (updatedAvailability[userId]?.['Morning']?.[nextDay]) {
            updatedAvailability[userId]['Morning'][nextDay].status = 'disabled';
            await updateAvailabilityStatus(currentCompany, weekKey, userId, 'Morning', nextDay, 'disabled');
        }
        if (updatedAvailability[userId]?.['Noon']?.[nextDay]) {
            updatedAvailability[userId]['Noon'][nextDay].status = 'disabled';
            await updateAvailabilityStatus(currentCompany, weekKey, userId, 'Noon', nextDay, 'disabled');
        }
    }
};

// Revert Night shift on previous day if no other Morning/Noon/Evening shift is selected
export const deselectMorningOrNoonShift = async (userId, day, updatedAvailability, weekKey, currentCompany) => {
    const previousDay = calculatePreviousDay(day);

    const hasOtherSelectedShifts = ['Morning', 'Noon', 'Evening'].some(
        (s) => updatedAvailability[userId]?.[s]?.[previousDay]?.status === 'selected'
    );

    if (
        updatedAvailability[userId]?.['Night']?.[previousDay]?.status === 'disabled' &&
        !hasOtherSelectedShifts
    ) {
        updatedAvailability[userId]['Night'][previousDay].status = 'default';
        await updateAvailabilityStatus(currentCompany, weekKey, userId, 'Night', previousDay, 'default');
    }
};

// Revert Morning/Noon shifts on next day if Night shift is deselected
export const deselectNightShift = async (userId, day, updatedAvailability, weekKey, weekOffset, currentCompany) => {
    const nextDay = calculateNextDay(day);

    if (day === 'Saturday') {
        const nextWeekKey = calculateWeekKey(weekOffset + 1);

        const hasSelectedShiftsOnSunday = ['Morning', 'Noon', 'Evening', 'Night'].some(
            (s) => updatedAvailability[userId]?.[s]?.['Sunday']?.status === 'selected'
        );

        if (!hasSelectedShiftsOnSunday) {
            if (updatedAvailability[userId]?.['Morning']?.['Sunday']) {
                await updateAvailabilityStatus(currentCompany, nextWeekKey, userId, 'Morning', 'Sunday', 'default');
            }
            if (updatedAvailability[userId]?.['Noon']?.['Sunday']) {
                await updateAvailabilityStatus(currentCompany, nextWeekKey, userId, 'Noon', 'Sunday', 'default');
            }
        }
    } else {
        const hasSelectedShiftsOnNextDay = ['Morning', 'Noon', 'Evening', 'Night'].some(
            (s) => updatedAvailability[userId]?.[s]?.[nextDay]?.status === 'selected'
        );

        if (!hasSelectedShiftsOnNextDay) {
            if (updatedAvailability[userId]?.['Morning']?.[nextDay]?.status === 'disabled') {
                updatedAvailability[userId]['Morning'][nextDay].status = 'default';
                await updateAvailabilityStatus(currentCompany, weekKey, userId, 'Morning', nextDay, 'default');
            }
            if (updatedAvailability[userId]?.['Noon']?.[nextDay]?.status === 'disabled') {
                updatedAvailability[userId]['Noon'][nextDay].status = 'default';
                await updateAvailabilityStatus(currentCompany, weekKey, userId, 'Noon', nextDay, 'default');
            }
        }
    }
};

// Get previous day name based on current day
export const calculatePreviousDay = (currentDay) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentIndex = daysOfWeek.indexOf(currentDay);
    return currentIndex > 0 ? daysOfWeek[currentIndex - 1] : daysOfWeek[6];
};

// Get next day name based on current day
export const calculateNextDay = (currentDay) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentIndex = daysOfWeek.indexOf(currentDay);
    return currentIndex < 6 ? daysOfWeek[currentIndex + 1] : daysOfWeek[0];
};

// Restore disabled shifts if current shift is deselected and no rules prevent it
export const handleOtherShiftsOfDayWhenDeselectAShift = async (userId, day, shift, updatedAvailability, weekKey, currentCompany) => {
    for (const otherShift of ['Morning', 'Noon', 'Evening', 'Night']) {
        if (otherShift !== shift && updatedAvailability[userId][otherShift][day].status === 'disabled') {
            if (otherShift === 'Morning' || otherShift === 'Noon') {
                const previousDay = calculatePreviousDay(day);
                if (
                    updatedAvailability[userId]?.['Night']?.[previousDay]?.status !== 'selected'
                ) {
                    updatedAvailability[userId][otherShift][day].status = 'default';
                    await updateAvailabilityStatus(currentCompany, weekKey, userId, otherShift, day, 'default');
                }
            } else if (otherShift === 'Night') {
                const nextDay = calculateNextDay(day);
                if (
                    !(
                        updatedAvailability[userId]?.['Morning']?.[nextDay]?.status === 'selected' ||
                        updatedAvailability[userId]?.['Noon']?.[nextDay]?.status === 'selected'
                    )
                ) {
                    updatedAvailability[userId][otherShift][day].status = 'default';
                    await updateAvailabilityStatus(currentCompany, weekKey, userId, otherShift, day, 'default');
                }
            } else {
                updatedAvailability[userId][otherShift][day].status = 'default';
                await updateAvailabilityStatus(currentCompany, weekKey, userId, otherShift, day, 'default');
            }
        }
    }
};

// Return formatted date strings for each day in the selected week
export const getWeekDates = (weekOffset) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + index);
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
        return `${day} ${formattedDate}`;
    });
};

// Return objects for each day of the selected week with date and weekday name
export const getWeekDateObjects = (weekOffset = 0) => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);

        const name = date.toLocaleDateString('en-US', { weekday: 'long' });
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formatted = `${day}/${month}/${year}`;

        return { name, date: formatted };
    });
};

// Format a JS Date object as dd/mm/yyyy
export const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};


