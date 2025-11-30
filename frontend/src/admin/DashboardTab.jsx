import React, { useState, useEffect } from "react";
import {
  getTaskMetrics,
  getRecentTasks,
  getRecentActivities,
} from "../api/taskapi"; // Adjust path as needed

const DashboardTab = () => {
  const [activities, setActivities] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
  
        const [metricsData, recentTasksData, recentActivitiesData] = await Promise.all([
          getTaskMetrics(),
          getRecentTasks(),
          getRecentActivities()
        ]);
  
        setTaskStats({
          total: metricsData.total || 0,
          pending: metricsData.pending || 0,
          inProgress: metricsData.inProgress || 0,
          completed: metricsData.completed || 0,
        });
  
        // Limit recent tasks to only the latest 4
        const latestTasks = Array.isArray(recentTasksData) 
          ? recentTasksData.slice(0, 4) 
          : [];
        
        setRecentTasks(latestTasks);
        setActivities(Array.isArray(recentActivitiesData) ? recentActivitiesData : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []);
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {[
          { label: "Total Tasks", value: taskStats.total, icon: "📊", color: "blue" },
          { label: "Pending", value: taskStats.pending, icon: "⏳", color: "yellow" },
          { label: "In Progress", value: taskStats.inProgress, icon: "🔄", color: "purple" },
          { label: "Completed", value: taskStats.completed, icon: "✅", color: "green" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-500 mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks - Limited to 4 */}
      <div className="bg-white rounded-lg shadow mb-6 md:mb-8">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Recent Tasks</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          {recentTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No recent tasks found
            </p>
          ) : (
            <table className="w-full">
              <thead className="text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="p-2 text-left">Task</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Priority</th>
                  <th className="p-2 text-left">Assignee</th>
                  <th className="p-2 text-left">Due Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100">
                    <td className="p-2">{task.title}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "Medium"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-2">{task.assignee?.name || "N/A"}</td>
                    <td className="p-2">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Team Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Team Activity</h3>
        </div>
        <div className="p-4">
        {Array.isArray(activities) && activities.length === 0 ? (
  <p className="text-gray-500 text-center py-4">No recent activity found</p>
) : (
  <div className="space-y-4">
    {Array.isArray(activities) &&
      activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded"
        >
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full bg-${activity.user?.color || "gray"}-500 flex items-center justify-center text-white mr-3`}
            >
              {activity.user?.initial || "U"}
            </div>
            <div>
              <p className="font-medium">{activity.user?.name || "Unknown"}</p>
              <p className="text-sm text-gray-500">{activity.action}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">{activity.time}</span>
        </div>
      ))}
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default DashboardTab;