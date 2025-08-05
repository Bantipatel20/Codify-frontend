// src/components/client/ProfilePage.js
import React, { useState } from 'react';
import { HiUser, HiMail, HiKey, HiCog, HiStar, HiFire, HiCode, HiBadgeCheck } from 'react-icons/hi';

const ProfilePage = () => {
  const user = { 
    name: 'Banti', 
    email: '23cs058@gmail.com',
    username: 'banti_coder',
    joinDate: '2024-09-15',
    department: 'CSE',
    semester: 3,
    division: 1,
    batch: 'A1'
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const stats = [
    { label: 'Problems Solved', value: '24', icon: HiCode, color: 'text-blue-400' },
    { label: 'Current Streak', value: '7 days', icon: HiFire, color: 'text-orange-400' },
    { label: 'Total Points', value: '2,450', icon: HiStar, color: 'text-yellow-400' },
    { label: 'Rank', value: '#15', icon: HiBadgeCheck, color: 'text-green-400' } // Changed from HiTrophy to HiBadgeCheck
  ];

  const achievements = [
    { title: 'First Problem Solved', description: 'Solved your first coding problem', date: '2024-09-20', icon: '🎯' },
    { title: 'Week Warrior', description: 'Solved problems for 7 consecutive days', date: '2024-12-15', icon: '🔥' },
    { title: 'Speed Demon', description: 'Solved 5 problems in under 2 hours', date: '2025-01-10', icon: '⚡' },
    { title: 'Problem Crusher', description: 'Solved 25+ problems', date: '2025-01-14', icon: '💪' }
  ];

  const handlePasswordReset = (e) => {
    e.preventDefault();
    console.log(`Password reset request for ${email}`);
    setMessage(`A password reset link has been sent to ${email}`);
    setEmail('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6">
            <HiUser className="text-3xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">My Profile</h1>
          <p className="text-gray-300 text-xl">Manage your account and track your achievements</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              👤 Profile Info
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🏆 Achievements
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
                <p className="text-gray-400 mb-1">@{user.username}</p>
                <p className="text-sm text-gray-500">Member since {user.joinDate}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                  <HiMail className="text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-xs text-gray-400">Email Address</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                  <HiUser className="text-green-400" />
                  <div>
                    <p className="text-white font-medium">{user.department} - Sem {user.semester}</p>
                    <p className="text-xs text-gray-400">Division {user.division}, Batch {user.batch}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <HiKey className="text-lg" />
                  <span className="font-medium">Reset Password</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl transition-all duration-300">
                  <HiCog className="text-lg" />
                  <span className="font-medium">Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user.name}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={user.username}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <input
                      type="text"
                      value={user.department}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                    <input
                      type="text"
                      value={user.semester}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Division & Batch</label>
                    <input
                      type="text"
                      value={`Division ${user.division} - Batch ${user.batch}`}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                          </div>
                          <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center">
                            <IconComponent className={`text-2xl ${stat.color}`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Progress Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Easy Problems</span>
                        <span className="text-green-400">8/12</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '67%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Medium Problems</span>
                        <span className="text-yellow-400">12/20</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Hard Problems</span>
                        <span className="text-red-400">4/15</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '27%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Your Achievements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-xl p-4 hover:border-gray-500 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{achievement.title}</h4>
                          <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                          <p className="text-xs text-gray-500">Earned on {achievement.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Reset Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Reset Password</h2>
              <form onSubmit={handlePasswordReset}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Enter your email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Send Reset Link
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {message && <p className="mt-4 text-green-400 text-center">{message}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
