import React, { useState } from "react";

const SettingsTab = ({ adminEmail }) => {
  const [formData, setFormData] = useState({
    systemName: "TaskMaster",
    adminEmail: adminEmail || "",
    timezone: "UTC (GMT+0)",
    emailNotifications: true,
    taskAssignmentNotifications: true,
    dueDateReminders: true,
    systemUpdates: false
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    // Reset save status when form is modified
    if (isSaved) {
      setIsSaved(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
    
      setIsSubmitting(false);
      setIsSaved(true);
      
      // Reset button state after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }, 800);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">System Settings</h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">General Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Name
                  </label>
                  <input
                    type="text"
                    name="systemName"
                    className="w-full border border-gray-300 rounded p-2"
                    value={formData.systemName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    className="w-full border border-gray-300 rounded p-2"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select 
                    name="timezone"
                    className="w-full border border-gray-300 rounded p-2"
                    value={formData.timezone}
                    onChange={handleInputChange}
                  >
                    <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                    <option value="America/New_York (GMT-4)">America/New_York (GMT-4)</option>
                    <option value="Europe/London (GMT+1)">Europe/London (GMT+1)</option>
                    <option value="Asia/Tokyo (GMT+9)">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Notification Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-notif"
                    name="emailNotifications"
                    className="mr-2"
                    checked={formData.emailNotifications}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="email-notif">Email Notifications</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="task-notif"
                    name="taskAssignmentNotifications"
                    className="mr-2"
                    checked={formData.taskAssignmentNotifications}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="task-notif">
                    Task Assignment Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="due-notif"
                    name="dueDateReminders"
                    className="mr-2"
                    checked={formData.dueDateReminders}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="due-notif">Due Date Reminders</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="system-notif"
                    name="systemUpdates"
                    className="mr-2"
                    checked={formData.systemUpdates}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="system-notif">System Updates</label>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSaved 
                  ? "bg-green-600 hover:bg-green-700" 
                  : isSubmitting 
                    ? "bg-gray-400" 
                    : "bg-indigo-600 hover:bg-indigo-700"
              } text-white px-4 py-2 rounded sm:mr-2 order-2 sm:order-1 flex items-center justify-center min-w-24`}
            >
              {isSubmitting ? (
                "Saving..."
              ) : isSaved ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button 
              type="button"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 order-1 sm:order-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsTab;