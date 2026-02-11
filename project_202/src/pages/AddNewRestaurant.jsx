import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddNewResturant = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        zip: "",
        phone: "",
        opentime: "",
        closetime: "",
        description: "",
        price: "$$",
        menu: JSON.stringify([{
            items: [{
                name: "",
                price: 0,
                description: ""
            }],
            category: ""
        }]),
        menu_photo: ""
    });

    const [menuItems, setMenuItems] = useState([
        {
          items: [
            {
              name: "",
              price: 0,
              description: ""
            }
          ],
          category: ""
        }
      ]);
      
      const handleMenuChange = (categoryIndex, itemIndex, field, value) => {
        const updatedMenu = [...menuItems];
        
        if (field === 'category') {
          updatedMenu[categoryIndex].category = value;
        } else {
          updatedMenu[categoryIndex].items[itemIndex][field] = 
            field === 'price' ? parseFloat(value) : value;
        }
      
        // Filter out empty items
        const validMenu = updatedMenu.filter(menu => 
          menu.items.some(item => 
            item.name && 
            item.price && 
            item.description
          ) && 
          menu.category
        );
      
        setMenuItems(updatedMenu);
        setFormData(prev => ({
          ...prev,
          menu: JSON.stringify(validMenu)
        }));
      };
      
      const addCategory = () => {
        setMenuItems([
          ...menuItems,
          {
            items: [
              {
                name: "",
                price: 0,
                description: ""
              }
            ],
            category: ""
          }
        ]);
      };
      
      const addItem = (categoryIndex) => {
        const updatedMenu = [...menuItems];
        updatedMenu[categoryIndex].items.push({
          name: "",
          price: 0,
          description: ""
        });
        setMenuItems(updatedMenu);
      };

      const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Handle numeric fields
        if (name === 'zip' || name === 'phone') {
          if (value === '' || /^\d+$/.test(value)) {
            setFormData(prev => ({
              ...prev,
              [name]: value
            }));
          }
          return;
        }
      
        // Handle all other fields
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const submitData = {
            name: formData.name,
            address: formData.address,
            zip: parseInt(formData.zip),
            phone: parseInt(formData.phone),
            opentime: formData.opentime,
            closetime: formData.closetime,
            description: formData.description,
            price: '$$',
            status: 1,
            menu: JSON.stringify(menuItems),  // Include the menu data
            menu_photo: formData.menu_photo
          };

        console.log(submitData);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch("http://127.0.0.1:8000/owner/add-listing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(submitData),
            });

            if (response.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/login');
                return;
            }

            if (response.status === 403) {
                alert("Access denied. Only business owners can add restaurants.");
                navigate('/');
                return;
            }

            const result = await response.json();

            if (response.ok) {
                alert("Restaurant added successfully");
                navigate('/business');
            } else {
                alert(result.detail || "Failed to add restaurant");
            }
        } catch (error) {
            console.error("Error adding restaurant:", error);
            alert("Failed to add restaurant");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="text-black border rounded-lg border-black m-5 px-4 py-4">
            <h2 className="w-full mx-auto text-center font-bold text-3xl py-4">Add New Restaurant</h2>
            <div className="grid grid-cols-2 py-4 px-4 gap-5 justify-center items-center w-full">
            <input
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Restaurant Name"
                />
                <input
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    required
                />
                <input
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    type="number"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="Zip Code"
                    required
                />

                <input
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                />

                <input
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    type="time"
                    name="opentime"
                    value={formData.opentime}
                    onChange={handleChange}
                    placeholder="HH:MM"
                    required
                />

                <input
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    type="time"
                    name="closetime"
                    value={formData.closetime}
                    onChange={handleChange}
                    placeholder="HH:MM"
                    required
                />

                <textarea
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    required
                />

                <input
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    type="text"
                    name="menu_photo"
                    value={formData.menu_photo}
                    onChange={handleChange}
                    placeholder="Photo URL"
                />
            </div>

            <div className="menu-section border p-4 rounded-lg mb-4">
                <h3 className="text-xl font-bold mb-4">Menu Items</h3>
                {menuItems.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-6 p-4 border rounded">
                        <input
                            className="bg-gray-200 rounded w-full p-2 mb-4"
                            type="text"
                            placeholder="Category Name"
                            value={category.category}
                            onChange={(e) => handleMenuChange(categoryIndex, 0, 'category', e.target.value)}
                        />
                        
                        {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex gap-4 mb-2">
                                <input
                                    className="bg-gray-200 rounded flex-grow p-2"
                                    type="text"
                                    placeholder="Item Name"
                                    value={item.name}
                                    onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'name', e.target.value)}
                                />
                                <input
                                    className="bg-gray-200 rounded w-24 p-2"
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'price', e.target.value)}
                                />
                                <input
                                    className="bg-gray-200 rounded flex-grow p-2"
                                    type="text"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'description', e.target.value)}
                                />
                            </div>
                        ))}
                        
                        <button
                            type="button"
                            onClick={() => addItem(categoryIndex)}
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                        >
                            Add Item
                        </button>
                    </div>
                ))}
                
                <button
                    type="button"
                    onClick={addCategory}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Add Category
                </button>
            </div>

            <button type="submit" className='shadow w-full bg-green-500 hover:bg-green-600 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded'>
                Add Restaurant
            </button>
        </form>
    );
};

export default AddNewResturant;