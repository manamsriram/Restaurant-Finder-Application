import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditResturantDetail = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const navigate = useNavigate();
    const { rid } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        owner: userInfo ? userInfo.uid : "",
        address: "",
        zip: "",
        phone: "",
        opentime: "",
        closetime: "",
        description: "",
        price: "",
        rating: "",
        status: "",
        menu: "",  
        menu_photo: ""
    });

    const deleteCategory = (categoryIndex) => {
        const updatedMenu = [...menuItems];
        updatedMenu.splice(categoryIndex, 1); // Remove the category at the specified index
        setMenuItems(updatedMenu);
      };
      
    const deleteItem = (categoryIndex, itemIndex) => {
    const updatedMenu = [...menuItems];
    updatedMenu[categoryIndex].items.splice(itemIndex, 1); // Remove the item at the specified index
    setMenuItems(updatedMenu);
    };

    const handleMenuChange = (categoryIndex, itemIndex, field, value) => {
        const updatedMenu = [...menuItems];
        if (field === 'category') {
          updatedMenu[categoryIndex].category = value;
        } else {
            updatedMenu[categoryIndex].items[itemIndex][field] = field === 'price' ? parseFloat(value) : value;
        }
        setMenuItems(updatedMenu);
      };
      
      const addItem = (categoryIndex) => {
        const updatedMenu = [...menuItems];
        updatedMenu[categoryIndex].items.push({ name: '', price: '', description: '' });
        setMenuItems(updatedMenu);
      };
      
      const addCategory = () => {
        setMenuItems([...menuItems, { category: '', items: [] }]);
      };

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`http://54.67.35.1/owner/view-listings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch restaurant");
                }
                const data = await response.json();
                const restaurant = data.find(r => r.rid === parseInt(rid));
                if (restaurant) {
                    setFormData({
                        name: restaurant.name,
                        address: restaurant.address,
                        zip: restaurant.zip,
                        phone: restaurant.phone,
                        opentime: restaurant.opentime,
                        closetime: restaurant.closetime,
                        description: restaurant.description,
                        status: restaurant.status,
                        menu: restaurant.menu,
                        menu_photo: restaurant.menu_photo
                    });
                    try {
                        const parsedMenu = JSON.parse(restaurant.menu);
                        setMenuItems(parsedMenu);
                      } catch (error) {
                        console.error("Error parsing menu:", error);
                        setMenuItems([]);
                      }
                }
            } catch (error) {
                console.error("Error fetching restaurant:", error);
            }
        };
        fetchRestaurant();
    }, [rid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'status' ? parseInt(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedData = {
            ...formData,
            status: parseInt(formData.status),
            zip: parseInt(formData.zip),
            phone: parseInt(formData.phone),
            rating: parseFloat(formData.rating),
            menu: JSON.stringify(menuItems) || "",
            menu_photo: formData.menu_photo || "",
            description: formData.description || "" 
        };
    
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://54.67.35.1/owner/update-listing/${rid}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedData),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update restaurant');
            }
    
            alert("Restaurant updated successfully");
            navigate('/business');
        } catch (error) {
            console.error("Error updating restaurant:", error);
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="text-black border rounded-lg border-black m-5 px-4 py-4">
            <h2 className="w-full mx-auto text-center font-bold text-3xl py-4">Edit Restaurant Details</h2>
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
                    name="menu_photo"
                    value={formData.menu_photo}
                    onChange={handleChange}
                    placeholder="Photo URL"
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

                <select
                    className='bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500'
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="1">Open</option>
                    <option value="0">Closed</option>
                </select>
            </div>
        
            <div className="menu-section border p-4 rounded-lg mb-4">
                <h3 className="text-xl font-bold mb-4">Menu Items</h3>
                {menuItems.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-6 p-4 border rounded">
                    <div className="flex justify-between items-center mb-4">
                        <input
                        className="bg-gray-200 rounded w-full p-2"
                        type="text"
                        placeholder="Category Name"
                        value={category.category}
                        onChange={(e) => handleMenuChange(categoryIndex, 0, 'category', e.target.value)}
                        />
                        <button
                        type="button"
                        onClick={() => deleteCategory(categoryIndex)}
                        className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                        >
                        Delete Category
                        </button>
                    </div>

                    {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex gap-4 mb-2 items-center">
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
                        <button
                            type="button"
                            onClick={() => deleteItem(categoryIndex, itemIndex)}
                            className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                        >
                            Delete Item
                        </button>
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
                    className="bg-green-500 text-white px-4 py-2 rounded mt-4"
                >
                    Add Category
                </button>
                </div>
            
            <button type="submit" className='shadow w-full bg-blue-500  focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded'>Update</button>
        </form>
    );
}

export default EditResturantDetail;