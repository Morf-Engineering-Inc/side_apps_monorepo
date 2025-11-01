import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/types/task-tracking";
import { Pause, Play, Plus, Square, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface TimeTrackerProps {
	tasks: Task[];
	onTasksChange: (tasks: Task[]) => void;
}

export function TimeTracker({ tasks, onTasksChange }: TimeTrackerProps) {
	const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
	const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});

	useEffect(() => {
		const interval = setInterval(() => {
			if (runningTaskId) {
				const task = tasks.find((t) => t.id === runningTaskId);
				if (task) {
					const runningEntry = task.timeEntries.find((e) => !e.endTime);
					if (runningEntry) {
						const elapsed = Math.floor(
							(Date.now() - new Date(runningEntry.startTime).getTime()) / 1000,
						);
						setElapsedTimes((prev) => ({
							...prev,
							[runningTaskId]: elapsed,
						}));
					}
				}
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [runningTaskId, tasks]);

	const addTask = () => {
		const newTask: Task = {
			id: crypto.randomUUID(),
			link: null,
			notes: null,
			timeEntries: [],
		};
		onTasksChange([...tasks, newTask]);
	};

	const removeTask = (taskId: string) => {
		onTasksChange(tasks.filter((t) => t.id !== taskId));
		if (runningTaskId === taskId) {
			setRunningTaskId(null);
		}
	};

	const updateTask = (
		taskId: string,
		field: "link" | "notes",
		value: string,
	) => {
		onTasksChange(
			tasks.map((t) =>
				t.id === taskId ? { ...t, [field]: value || null } : t,
			),
		);
	};

	const startTimer = (taskId: string) => {
		if (runningTaskId && runningTaskId !== taskId) {
			pauseTimer(runningTaskId);
		}

		onTasksChange(
			tasks.map((t) =>
				t.id === taskId
					? {
							...t,
							timeEntries: [
								...t.timeEntries,
								{
									startTime: new Date().toISOString(),
									endTime: null,
									duration: 0,
								},
							],
						}
					: t,
			),
		);
		setRunningTaskId(taskId);
		setElapsedTimes((prev) => ({ ...prev, [taskId]: 0 }));
	};

	const pauseTimer = (taskId: string) => {
		const task = tasks.find((t) => t.id === taskId);
		if (!task) return;

		const runningEntry = task.timeEntries.find((e) => !e.endTime);
		if (!runningEntry) return;

		const endTime = new Date().toISOString();
		const duration = Math.floor(
			(new Date(endTime).getTime() -
				new Date(runningEntry.startTime).getTime()) /
				1000,
		);

		onTasksChange(
			tasks.map((t) =>
				t.id === taskId
					? {
							...t,
							timeEntries: t.timeEntries.map((e) =>
								e.startTime === runningEntry.startTime
									? { ...e, endTime, duration }
									: e,
							),
						}
					: t,
			),
		);

		if (runningTaskId === taskId) {
			setRunningTaskId(null);
		}
	};

	const stopTimer = (taskId: string) => {
		pauseTimer(taskId);
	};

	const getTotalTime = (task: Task): number => {
		const completedTime = task.timeEntries
			.filter((e) => e.endTime)
			.reduce((sum, e) => sum + e.duration, 0);
		const runningTime =
			runningTaskId === task.id ? elapsedTimes[task.id] || 0 : 0;
		return completedTime + runningTime;
	};

	const getTotalDayTime = (): number => {
		return tasks.reduce((sum, task) => sum + getTotalTime(task), 0);
	};

	const formatTime = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const isTaskRunning = (taskId: string): boolean => {
		return runningTaskId === taskId;
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-semibold">Time Tracking</h3>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Total today: {formatTime(getTotalDayTime())}
					</p>
				</div>
				<Button onClick={addTask} size="sm" variant="outline">
					<Plus className="h-4 w-4 mr-2" />
					Add Task
				</Button>
			</div>

			{tasks.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center text-zinc-500 dark:text-zinc-500">
						No tasks yet. Click "Add Task" to start tracking your work.
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{tasks.map((task) => (
						<Card key={task.id} className="relative">
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<CardTitle className="text-base font-medium">
										{formatTime(getTotalTime(task))}
									</CardTitle>
									<Button
										onClick={() => removeTask(task.id)}
										size="sm"
										variant="ghost"
										className="h-6 w-6 p-0"
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="space-y-2">
									<Label className="text-xs">Link (GitHub issue, etc.)</Label>
									<Input
										placeholder="https://github.com/..."
										value={task.link || ""}
										onChange={(e) =>
											updateTask(task.id, "link", e.target.value)
										}
										className="h-8 text-sm"
									/>
								</div>

								<div className="space-y-2">
									<Label className="text-xs">Notes</Label>
									<Textarea
										placeholder="Task details..."
										value={task.notes || ""}
										onChange={(e) =>
											updateTask(task.id, "notes", e.target.value)
										}
										className="min-h-16 text-sm"
									/>
								</div>

								<div className="flex gap-2">
									{!isTaskRunning(task.id) ? (
										<Button
											onClick={() => startTimer(task.id)}
											size="sm"
											className="flex-1"
											variant="default"
										>
											<Play className="h-3 w-3 mr-2" />
											Start
										</Button>
									) : (
										<>
											<Button
												onClick={() => pauseTimer(task.id)}
												size="sm"
												className="flex-1"
												variant="secondary"
											>
												<Pause className="h-3 w-3 mr-2" />
												Pause
											</Button>
											<Button
												onClick={() => stopTimer(task.id)}
												size="sm"
												className="flex-1"
												variant="destructive"
											>
												<Square className="h-3 w-3 mr-2" />
												Stop
											</Button>
										</>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
