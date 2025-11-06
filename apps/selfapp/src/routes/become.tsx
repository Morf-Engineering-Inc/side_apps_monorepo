import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import SideNav from '@/components/SideNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, Heart, BookOpen, Target, TrendingUp } from 'lucide-react';

export const Route = createFileRoute('/become')({
  component: RouteComponent,
});

function RouteComponent() {
  const [entries, setEntries] = useState<any[]>([]);
  const [currentEntry, setCurrentEntry] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    action: '',
    motive: '',
    conscienceCheck: false,
    hearingHisVoice: false,
    losingEvilDesires: false,
    servingOthers: false,
    reflection: '',
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spiritualProgress');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('spiritualProgress', JSON.stringify(entries));
    }
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEntries([...entries, { ...currentEntry, id: Date.now() }]);
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      action: '',
      motive: '',
      conscienceCheck: false,
      hearingHisVoice: false,
      losingEvilDesires: false,
      servingOthers: false,
      reflection: '',
    });
  };

  // Calculate conversion metrics
  const calculateProgress = () => {
    if (entries.length === 0) return { becoming: 0, charity: 0, conversion: 0 };

    const recent = entries.slice(-10); // Last 10 entries
    const becoming =
      (recent.filter((e) => e.conscienceCheck).length / recent.length) * 100;
    const charity =
      (recent.filter(
        (e) => e.servingOthers && e.motive.toLowerCase().includes('love')
      ).length /
        recent.length) *
      100;
    const conversion =
      (recent.filter((e) => e.hearingHisVoice && e.losingEvilDesires).length /
        recent.length) *
      100;

    return { becoming, charity, conversion };
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-4 md:p-8">
      <div className="bg-grid min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          <SideNav />
          <main className="md:col-span-9 lg:col-span-9">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Spiritual Progress Tracker
                </h1>
                <p className="text-gray-600 italic">
                  "To obtain the measure and stature of Christ" - Paul
                  (Ephesians 4:13)
                </p>
                <p className="text-sm text-gray-500">
                  Focus: What have we BECOME, not just what we've DONE
                </p>
              </div>

              {/* Scripture Foundation */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <BookOpen className="w-5 h-5" />
                    Foundation Principles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-blue-800">
                  <p>
                    • <strong>Old Testament:</strong> Law and commandments
                    prepare hearts
                  </p>
                  <p>
                    • <strong>New Testament:</strong> Christ's atonement enables
                    transformation
                  </p>
                  <p>
                    • <strong>Book of Mormon:</strong> The key to unlock both
                    testaments
                  </p>
                  <p className="pt-2 italic">
                    "It's not enough just to do it - it's doing it for the right
                    reason" - Elder Dallin H. Oaks
                  </p>
                </CardContent>
              </Card>

              {/* Progress Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Becoming (Character)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={progress.becoming} className="h-2" />
                      <p className="text-2xl font-bold">
                        {Math.round(progress.becoming)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Clear conscience maintained
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      Charity (Pure Love)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={progress.charity} className="h-2" />
                      <p className="text-2xl font-bold">
                        {Math.round(progress.charity)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Service with pure motives
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Conversion Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={progress.conversion} className="h-2" />
                      <p className="text-2xl font-bold">
                        {Math.round(progress.conversion)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Hearing His voice, losing evil desires
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Entry Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Reflection</CardTitle>
                  <CardDescription>
                    Track what you're BECOMING, not just what you're DOING
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={currentEntry.date}
                          onChange={(e) =>
                            setCurrentEntry({
                              ...currentEntry,
                              date: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Action/Work Done
                        </label>
                        <input
                          type="text"
                          value={currentEntry.action}
                          onChange={(e) =>
                            setCurrentEntry({
                              ...currentEntry,
                              action: e.target.value,
                            })
                          }
                          placeholder="What did you do?"
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Motive/Intent (The REAL measure)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.motive}
                        onChange={(e) =>
                          setCurrentEntry({
                            ...currentEntry,
                            motive: e.target.value,
                          })
                        }
                        placeholder="WHY did you do it? What was in your heart?"
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    {/* Conversion Indicators */}
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-sm">
                        Signs of Conversion & Becoming:
                      </p>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEntry.conscienceCheck}
                          onChange={(e) =>
                            setCurrentEntry({
                              ...currentEntry,
                              conscienceCheck: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          Clear conscience - Did I act with integrity?
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEntry.hearingHisVoice}
                          onChange={(e) =>
                            setCurrentEntry({
                              ...currentEntry,
                              hearingHisVoice: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          Hearing HIS voice (not the world's voice)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEntry.losingEvilDesires}
                          onChange={(e) =>
                            setCurrentEntry({
                              ...currentEntry,
                              losingEvilDesires: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          Losing desires to do evil - No desire for sin today
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEntry.servingOthers}
                          onChange={(e) =>
                            setCurrentEntry({
                              ...currentEntry,
                              servingOthers: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          Service blessed others & God's kingdom
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Reflection: What am I BECOMING?
                      </label>
                      <textarea
                        value={currentEntry.reflection}
                        onChange={(e) =>
                          setCurrentEntry({
                            ...currentEntry,
                            reflection: e.target.value,
                          })
                        }
                        placeholder="Not how long you worked, but what have you become by your labors? Are you developing the Mind of Christ?"
                        className="w-full p-2 border rounded h-24"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Record Progress
                    </button>
                  </form>
                </CardContent>
              </Card>

              {/* Key Reminder */}
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm text-amber-900">
                    <p className="font-bold">
                      Remember the Parable of the Vineyard Workers:
                    </p>
                    <p>
                      The reward is NOT based on hours worked. Some require
                      longer than others to become what God intends. Focus on
                      YOUR journey of becoming, not comparing yourself to
                      others.
                    </p>
                    <p className="italic pt-2">
                      "The condition of our souls - what we have BECOME -
                      matters more than the works themselves."
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Entries */}
              {entries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entries
                        .slice(-5)
                        .reverse()
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-medium">{entry.action}</p>
                              <span className="text-sm text-gray-500">
                                {entry.date}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 italic">
                              Motive: {entry.motive}
                            </p>
                            {entry.reflection && (
                              <p className="text-sm text-gray-700 mt-2">
                                {entry.reflection}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {entry.conscienceCheck && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  <Check className="w-3 h-3 inline mr-1" />
                                  Clear Conscience
                                </span>
                              )}
                              {entry.hearingHisVoice && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  His Voice
                                </span>
                              )}
                              {entry.losingEvilDesires && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  No Evil Desires
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default RouteComponent;
