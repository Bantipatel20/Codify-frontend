// src/components/client/ProfilePage.js
import React, { useState } from 'react';

const ProfilePage = () => {
  const user = { name: 'Banti', email: '23cs058@gmail.com' }; // Sample user data
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [email, setEmail] = useState(''); // State for email input
  const [message, setMessage] = useState(''); // State for messages

  const handlePasswordReset = (e) => {
    e.preventDefault();
    // Here you would typically send a request to your backend to initiate a password reset
    console.log(`Password reset request for ${email}`);
    setMessage(`A password reset link has been sent to ${email}`);
    setEmail(''); // Reset the email input
    setIsModalOpen(false); // Close the modal after submission
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
      <div className="mt-4">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="mt-6 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-300"
      >
        Reset Password
      </button>

      {/* Modal for Password Reset */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80">
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>
            <form onSubmit={handlePasswordReset}>
              <div className="mb-4">
                <label className="block mb-2">Enter your email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded w-full p-2"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
              >
                Submit
              </button>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="mt-2 text-red-600 hover:underline"
              >
                Cancel
              </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>} {/* Display message after submission */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
