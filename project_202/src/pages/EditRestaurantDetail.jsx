import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { apiUrl } from '../lib/api';

const createCategory = () => ({ category: '', items: [] });

const EditResturantDetail = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const navigate = useNavigate();
  const { rid } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    owner: userInfo ? userInfo.uid : '',
    address: '',
    zip: '',
    phone: '',
    opentime: '',
    closetime: '',
    description: '',
    price: '',
    rating: '',
    status: '',
    menu: '',
    menu_photo: '',
  });

  const menuPreview = useMemo(() => {
    return menuItems.filter(
      (menu) => menu.category.trim() && menu.items.some((item) => item.name.trim())
    );
  }, [menuItems]);

  const deleteCategory = (categoryIndex) => {
    setMenuItems((prev) => prev.filter((_, index) => index !== categoryIndex));
  };

  const deleteItem = (categoryIndex, itemIndex) => {
    setMenuItems((prev) => {
      const next = [...prev];
      next[categoryIndex].items.splice(itemIndex, 1);
      return next;
    });
  };

  const handleMenuChange = (categoryIndex, itemIndex, field, value) => {
    setMenuItems((prev) => {
      const next = [...prev];
      if (field === 'category') {
        next[categoryIndex].category = value;
      } else {
        next[categoryIndex].items[itemIndex][field] = field === 'price' ? parseFloat(value) || 0 : value;
      }
      return next;
    });
  };

  const addItem = (categoryIndex) => {
    setMenuItems((prev) => {
      const next = [...prev];
      next[categoryIndex].items.push({ name: '', price: '', description: '' });
      return next;
    });
  };

  const addCategory = () => {
    setMenuItems((prev) => [...prev, createCategory()]);
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(apiUrl('/owner/view-listings'), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch restaurant');
        }

        const data = await response.json();
        const restaurant = data.find((entry) => entry.rid === parseInt(rid, 10));

        if (restaurant) {
          setFormData({
            name: restaurant.name || '',
            address: restaurant.address || '',
            zip: restaurant.zip || '',
            phone: restaurant.phone || '',
            opentime: restaurant.opentime || '',
            closetime: restaurant.closetime || '',
            description: restaurant.description || '',
            status: restaurant.status || '1',
            price: restaurant.price || '',
            rating: restaurant.rating || '',
            menu: restaurant.menu || '',
            menu_photo: restaurant.menu_photo || '',
          });

          try {
            const parsedMenu = JSON.parse(restaurant.menu || '[]');
            setMenuItems(parsedMenu.length ? parsedMenu : [createCategory()]);
          } catch (error) {
            console.error('Error parsing menu:', error);
            setMenuItems([createCategory()]);
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    };

    fetchRestaurant();
  }, [rid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'status' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
      status: parseInt(formData.status, 10),
      zip: parseInt(formData.zip, 10),
      phone: parseInt(formData.phone, 10),
      rating: parseFloat(formData.rating),
      menu: JSON.stringify(menuPreview) || '',
      menu_photo: formData.menu_photo || '',
      description: formData.description || '',
    };

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl(`/owner/update-listing/${rid}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update restaurant');
      }

      alert('Restaurant updated successfully');
      navigate('/business');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert(error.message);
    }
  };

  return (
    <PageShell className="rf-page rf-fade-up">
      <HeroCard>
        <div>
          <Eyebrow>Owner workspace</Eyebrow>
          <h1>Edit restaurant listing</h1>
          <p>
            Update the listing details, adjust menu sections, and keep availability accurate.
          </p>
        </div>
        <HeroMeta>
          <MetaTile>
            <span>Categories</span>
            <strong>{menuPreview.length}</strong>
          </MetaTile>
          <MetaTile>
            <span>Status</span>
            <strong>{formData.status === 1 ? 'Open' : 'Closed'}</strong>
          </MetaTile>
        </HeroMeta>
      </HeroCard>

      <FormShell onSubmit={handleSubmit}>
        <SectionCard>
          <SectionTitle>Restaurant Details</SectionTitle>
          <FieldGrid>
            <Field>
              <label htmlFor="name">Restaurant Name</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Restaurant Name" />
            </Field>
            <Field>
              <label htmlFor="menu_photo">Photo URL</label>
              <input id="menu_photo" type="text" name="menu_photo" value={formData.menu_photo} onChange={handleChange} placeholder="Photo URL" />
            </Field>
            <Field>
              <label htmlFor="address">Address</label>
              <input id="address" type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Address" />
            </Field>
            <Field>
              <label htmlFor="zip">Zip Code</label>
              <input id="zip" type="number" name="zip" value={formData.zip} onChange={handleChange} required placeholder="Zip Code" />
            </Field>
            <Field>
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone Number" />
            </Field>
            <Field>
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="1">Open</option>
                <option value="0">Closed</option>
              </select>
            </Field>
            <Field>
              <label htmlFor="opentime">Opening Time</label>
              <input id="opentime" type="time" name="opentime" value={formData.opentime} onChange={handleChange} required />
            </Field>
            <Field>
              <label htmlFor="closetime">Closing Time</label>
              <input id="closetime" type="time" name="closetime" value={formData.closetime} onChange={handleChange} required />
            </Field>
            <Field className="full-span">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
            </Field>
          </FieldGrid>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Menu Builder</SectionTitle>
          <SectionHint>Use categories to organize items and keep menu changes easy to scan.</SectionHint>

          <MenuStack>
            {menuItems.map((category, categoryIndex) => (
              <CategoryCard key={categoryIndex}>
                <CategoryHeader>
                  <Field>
                    <label>Category Name</label>
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={category.category}
                      onChange={(e) => handleMenuChange(categoryIndex, 0, 'category', e.target.value)}
                    />
                  </Field>
                  <DangerButton type="button" onClick={() => deleteCategory(categoryIndex)}>Delete Category</DangerButton>
                </CategoryHeader>

                {category.items.map((item, itemIndex) => (
                  <ItemRow key={itemIndex}>
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'price', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleMenuChange(categoryIndex, itemIndex, 'description', e.target.value)}
                    />
                    <DangerButton type="button" onClick={() => deleteItem(categoryIndex, itemIndex)}>Delete</DangerButton>
                  </ItemRow>
                ))}

                <ActionRow>
                  <SecondaryButton type="button" onClick={() => addItem(categoryIndex)}>Add Item</SecondaryButton>
                </ActionRow>
              </CategoryCard>
            ))}
          </MenuStack>

          <ActionRow className="mt-4">
            <PrimaryButton type="button" onClick={addCategory}>Add Category</PrimaryButton>
          </ActionRow>
        </SectionCard>

        <SubmitRow>
          <PrimaryButton type="submit" className="wide">Update Restaurant</PrimaryButton>
        </SubmitRow>
      </FormShell>
    </PageShell>
  );
};

const PageShell = styled.div`
  padding: 1.5rem 0 2rem;
`;

const HeroCard = styled.section`
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 1rem;
  align-items: stretch;
  margin-bottom: 1rem;
  padding: 1.4rem;
  border-radius: 24px;
  background:
    radial-gradient(circle at 8% 18%, rgba(244, 163, 0, 0.34), transparent 36%),
    linear-gradient(125deg, #1f2421, #167a72);
  color: #fff;
  box-shadow: 0 16px 40px rgba(31, 36, 33, 0.22);

  h1 {
    margin: 0.35rem 0 0.7rem;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.02;
  }

  p {
    margin: 0;
    max-width: 62ch;
    color: rgba(255, 255, 255, 0.86);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Eyebrow = styled.div`
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  opacity: 0.75;
`;

const HeroMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
`;

const MetaTile = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);

  span {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.78);
  }

  strong {
    margin-top: 0.3rem;
    font-size: 1.5rem;
    font-family: 'Fraunces', serif;
  }
`;

const FormShell = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionCard = styled.section`
  padding: 1.1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid #eee2d5;
  box-shadow: 0 10px 28px rgba(31, 36, 33, 0.08);
`;

const SectionTitle = styled.h2`
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
`;

const SectionHint = styled.p`
  margin: 0 0 1rem;
  color: #60706a;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;

  .full-span {
    grid-column: 1 / -1;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.92rem;
    font-weight: 600;
    color: #3f4a45;
  }

  input,
  textarea,
  select {
    width: 100%;
    border: 1px solid #ddcfbf;
    border-radius: 14px;
    background: #f8f4ec;
    padding: 0.78rem 0.9rem;
    color: #1f2421;
    outline: none;
    font: inherit;
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }

  input:focus,
  textarea:focus,
  select:focus {
    border-color: #167a72;
    box-shadow: 0 0 0 2px rgba(22, 122, 114, 0.12);
  }
`;

const MenuStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const CategoryCard = styled.div`
  padding: 1rem;
  border-radius: 18px;
  background: #fffdf8;
  border: 1px solid #eadfce;
`;

const CategoryHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.8rem;
  align-items: end;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.45fr 1fr auto;
  gap: 0.7rem;
  margin-top: 0.8rem;

  input {
    width: 100%;
    border: 1px solid #ddcfbf;
    border-radius: 12px;
    background: #f8f4ec;
    padding: 0.72rem 0.85rem;
    color: #1f2421;
    outline: none;
    font: inherit;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 0.75rem;
  margin-top: 0.85rem;
  flex-wrap: wrap;
`;

const SubmitRow = styled.div`
  display: flex;
  justify-content: flex-end;

  .wide {
    min-width: 200px;
  }
`;

const PrimaryButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.72rem 1.1rem;
  background: linear-gradient(125deg, #c7522a, #de6f32);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

const SecondaryButton = styled.button`
  border: 1px solid #d8cbbb;
  border-radius: 999px;
  padding: 0.72rem 1.1rem;
  background: #fff;
  color: #1f2421;
  font-weight: 700;
  cursor: pointer;
`;

const DangerButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: linear-gradient(125deg, #c8384a, #e1606c);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

export default EditResturantDetail;
