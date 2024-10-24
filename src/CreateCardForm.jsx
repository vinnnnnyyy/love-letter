import React, { useState } from 'react';

const CreateCardForm = ({ onAddCard }) => {
  const [formData, setFormData] = useState({
    recipient: '',
    creator: 'girlfriend',
    message: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCard(formData);
    setFormData({
      recipient: '',
      creator: 'girlfriend',
      message: '',
      password: ''
    });
  };

  const getButtonColor = () => {
    return formData.creator === 'girlfriend' 
      ? 'bg-pink-500 hover:bg-pink-600' 
      : 'bg-blue-500 hover:bg-blue-600';
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Recipient Name"
          value={formData.recipient}
          onChange={(e) => setFormData({...formData, recipient: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={formData.creator}
          onChange={(e) => setFormData({...formData, creator: e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="girlfriend">Girlfriend</option>
          <option value="boyfriend">Boyfriend</option>
        </select>
        <textarea
          placeholder="Your Message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full p-2 border rounded"
          required
          rows="4"
        />
        <input
          type="password"
          placeholder="Set a password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className={`w-full ${getButtonColor()} text-white py-2 rounded`}
        >
          Create Love Letter
        </button>
      </div>
    </form>
  );
};

export default CreateCardForm;
