import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { apiUrl } from '../lib/api';

const createMenuItem = () => ({
  category: '',
  items: [
    {
      name: '',
      price: 0,
      description: '',
    },
  ],
});

const AddNewResturant = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    zip: '',
    phone: '',
    opentime: '',
    closetime: '',
    description: '',
    price: '$$',
    menu_photo: '',
  });
  const [menuItems, setMenuItems] = useState([createMenuItem()]);

  const menuPreview = useMemo(() => {
    return menuItems.filter(
      (menu) => menu.category.trim() && menu.items.some((item) => item.name.trim())
    );
  }, [menuItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'zip' || name === 'phone') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMenuChange = (categoryIndex, itemIndex, field, value) => {
    const updatedMenu = [...menuItems];

    if (field === 'category') {
      updatedMenu[categoryIndex].category = value;
    } else {
      updatedMenu[categoryIndex].items[itemIndex][field] = field === 'price' ? parseFloat(value) || 0 : value;
    }

    setMenuItems(updatedMenu);
  };

  const addCategory = () => {
    setMenuItems((prev) => [...prev, createMenuItem()]);
  };

  const addItem = (categoryIndex) => {
    setMenuItems((prev) => {
      const next = [...prev];
      next[categoryIndex].items.push({ name: '', price: 0, description: '' });
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      name: formData.name,
      address: formData.address,
      zip: parseInt(formData.zip, 10),
      phone: parseInt(formData.phone, 10),
      opentime: formData.opentime,
      closetime: formData.closetime,
      description: formData.description,
      price: '$$',
      status: 1,
      menu: JSON.stringify(menuPreview),
      menu_photo: formData.menu_photo,
    };

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(apiUrl('/owner/add-listing'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
        return;
      }

      if (response.status === 403) {
        alert('Access denied. Only business owners can add restaurants.');
        navigate('/');
        return;
      }

      const result = await response.json();

      if (response.ok) {
        alert('Restaurant added successfully');
        navigate('/business');
      } else {
        alert(result.detail || 'Failed to add restaurant');
      }
    } catch (error) {
      console.error('Error adding restaurant:', error);
      alert('Failed to add restaurant');
    }
  };

  return (
    <PageShell className="rf-page rf-fade-up">
      <HeroCard>
        <div>
          <Eyebrow>Owner workspace</Eyebrow>
          <h1>Publish a new restaurant listing</h1>
          <p>
            Build a polished listing with hours, menu structure, and imagery. Keep it crisp, accurate, and easy to browse.
          </p>
        </div>
        <HeroMeta>
          <MetaTile>
            <span>Menu sections</span>
            <strong>{menuPreview.length}</strong>
          </MetaTile>
          <MetaTile>
            <span>Listing status</span>
            <strong>Draft</strong>
          </MetaTile>
        </HeroMeta>
      </HeroCard>

      <FormShell onSubmit={handleSubmit}>
        <FormGrid>
          <SectionCard>
            <SectionTitle>Restaurant Details</SectionTitle>
            <FieldGrid>
              <Field>
                <label htmlFor="name">Restaurant Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Restaurant Name" />
              </Field>
              <Field>
                <label htmlFor="address">Address</label>
                <input id="address" name="address" value={formData.address} onChange={handleChange} required placeholder="Street address" />
              </Field>
              <Field>
                <label htmlFor="zip">Zip Code</label>
                <input id="zip" name="zip" type="text" value={formData.zip} onChange={handleChange} required placeholder="78701" />
              </Field>
              <Field>
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="5551234567" />
              </Field>
              <Field>
                <label htmlFor="opentime">Opening Time</label>
                <input id="opentime" name="opentime" type="time" value={formData.opentime} onChange={handleChange} required />
              </Field>
              <Field>
                <label htmlFor="closetime">Closing Time</label>
                <input id="closetime" name="closetime" type="time" value={formData.closetime} onChange={handleChange} required />
              </Field>
              <Field className="full-span">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} required placeholder="A short summary of the restaurant" />
              </Field>
              <Field className="full-span">
                <label htmlFor="menu_photo">Photo URL</label>
                <input id="menu_photo" name="menu_photo" value={formData.menu_photo} onChange={handleChange} placeholder="https://..." />
              </Field>
            </FieldGrid>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Menu Builder</SectionTitle>
            <SectionHint>Start with a category, then add items and descriptions. Menu price tier is calculated automatically.</SectionHint>

            <MenuStack>
              {menuItems.map((category, categoryIndex) => (
                <CategoryCard key={categoryIndex}>
                  <Field>
                    <label>Category Name</label>
                    <input
                      type="text"
                      placeholder="Starters, Mains, Drinks"
                      value={category.category}
                      onChange={(e) => handleMenuChange(categoryIndex, 0, 'category', e.target.value)}
                    />
                  </Field>

                  {category.items.map((item, itemIndex) => (
                    <ItemRow key={itemIndex}>
                      <input
                        type="text"
                        placeholder="Item name"
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
        </FormGrid>

        <SubmitRow>
          <PrimaryButton type="submit" className="wide">Add Restaurant</PrimaryButton>
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
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
  textarea {
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
  textarea:focus {
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

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.5fr 1fr;
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

export default AddNewResturant;
