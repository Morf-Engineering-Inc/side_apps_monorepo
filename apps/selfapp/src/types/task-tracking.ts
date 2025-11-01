export interface TimeEntry {
	startTime: string;
	endTime: string | null;
	duration: number;
}

export interface Task {
	id: string;
	link: string | null;
	notes: string | null;
	timeEntries: TimeEntry[];
}

export interface ExtendedDailyLogEntryModel {
	tasks?: Task[] | null;
}
