import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  FiUpload, 
  FiX, 
  FiImage, 
  FiType, 
  FiTrash2, 
  FiEdit2,
  FiSave,
  FiMove
} from "react-icons/fi";

export default function Documents() {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(`moodboard_${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState("image");
  const [editingItem, setEditingItem] = useState(null);
  const [newText, setNewText] = useState("");
  const [editFontSize, setEditFontSize] = useState(24);
  const [editColor, setEditColor] = useState("#090F15");
  const [draggedItem, setDraggedItem] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`moodboard_${user?.id}`, JSON.stringify(items));
    }
  }, [items, user?.id]);

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newItem = {
          id: Date.now(),
          type: 'image',
          content: event.target.result,
          x: Math.random() * 300 + 50,
          y: Math.random() * 300 + 50,
          width: 200,
          height: 200,
          rotation: 0,
          zIndex: items.length
        };
        setItems([...items, newItem]);
        setShowAddModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    if (newText.trim()) {
      const newItem = {
        id: Date.now(),
        type: 'text',
        content: newText.trim(),
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
        width: 250,
        height: 100,
        rotation: 0,
        zIndex: items.length,
        fontSize: 24,
        color: '#090F15',
        fontFamily: 'Inter'
      };
      setItems([...items, newItem]);
      setNewText("");
      setShowAddModal(false);
    }
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleStartDrag = (e, item) => {
    e.preventDefault();
    setDraggedItem({ ...item, offsetX: e.clientX - item.x, offsetY: e.clientY - item.y });
  };

  const handleDrag = (e) => {
    if (draggedItem) {
      const newX = e.clientX - draggedItem.offsetX;
      const newY = e.clientY - draggedItem.offsetY;
      setItems(prevItems => prevItems.map(item => 
        item.id === draggedItem.id 
          ? { ...item, x: Math.max(0, newX), y: Math.max(0, newY) }
          : item
      ));
    }
  };

  const handleEndDrag = () => {
    setDraggedItem(null);
  };

  const handleResize = (e, item, direction) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = item.width;
    const startHeight = item.height;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) newWidth = Math.max(100, startWidth + deltaX);
      if (direction.includes('left')) newWidth = Math.max(100, startWidth - deltaX);
      if (direction.includes('bottom')) newHeight = Math.max(100, startHeight + deltaY);
      if (direction.includes('top')) newHeight = Math.max(100, startHeight - deltaY);

      setItems(items.map(i => 
        i.id === item.id ? { ...i, width: newWidth, height: newHeight } : i
      ));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRotate = (e, item) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    const startAngle = Math.atan2(startY - centerY, startX - centerX) * 180 / Math.PI;
    const startRotation = item.rotation;

    const handleMouseMove = (moveEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * 180 / Math.PI;
      const newRotation = startRotation + (currentAngle - startAngle);
      setItems(items.map(i => 
        i.id === item.id ? { ...i, rotation: newRotation } : i
      ));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (draggedItem) {
      const handleMouseMove = (e) => handleDrag(e);
      const handleMouseUp = () => handleEndDrag();
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">Moodboard</h1>
          </div>
          <div className="top-bar-right">
            <button 
              className="btn-create"
              onClick={() => setShowAddModal(true)}
            >
              <FiUpload />
              Add Item
            </button>
          </div>
        </header>

        <div className="dashboard-content-glass moodboard-container">
          {items.length === 0 ? (
            <div className="empty-page-state">
              <FiImage className="empty-page-icon" />
              <h2>Your moodboard is empty</h2>
              <p>Start adding images and text to create your inspiration board!</p>
              <button 
                className="btn primary" 
                style={{ marginTop: "20px" }}
                onClick={() => setShowAddModal(true)}
              >
                <FiUpload />
                Add Your First Item
              </button>
            </div>
          ) : (
            <div 
              className="moodboard-canvas"
              onMouseMove={handleDrag}
              onMouseUp={handleEndDrag}
            >
              <div className="moodboard-grid-overlay"></div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="moodboard-item"
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    transform: `rotate(${item.rotation}deg)`,
                    zIndex: item.zIndex
                  }}
                  onMouseDown={(e) => handleStartDrag(e, item)}
                >
                  {item.type === 'image' ? (
                    <img src={item.content} alt="Moodboard" className="moodboard-image" />
                  ) : (
                    <div 
                      className="moodboard-text"
                      style={{
                        fontSize: `${item.fontSize}px`,
                        color: item.color,
                        fontFamily: item.fontFamily
                      }}
                    >
                      {item.content}
                    </div>
                  )}
                  
                  <div className="moodboard-item-controls">
                    <button
                      className="moodboard-control-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                        if (item.type === 'text') {
                          setNewText(item.content);
                          setEditFontSize(item.fontSize || 24);
                          setEditColor(item.color || '#090F15');
                        }
                      }}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="moodboard-control-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="moodboard-resize-handles">
                    <div 
                      className="resize-handle resize-top-left"
                      onMouseDown={(e) => handleResize(e, item, 'top-left')}
                    />
                    <div 
                      className="resize-handle resize-top-right"
                      onMouseDown={(e) => handleResize(e, item, 'top-right')}
                    />
                    <div 
                      className="resize-handle resize-bottom-left"
                      onMouseDown={(e) => handleResize(e, item, 'bottom-left')}
                    />
                    <div 
                      className="resize-handle resize-bottom-right"
                      onMouseDown={(e) => handleResize(e, item, 'bottom-right')}
                    />
                  </div>

                  <div 
                    className="moodboard-rotate-handle"
                    onMouseDown={(e) => handleRotate(e, item)}
                  >
                    <FiMove />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content moodboard-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add to Moodboard</h2>
                <button
                  className="icon-btn-small"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddType("image");
                    setNewText("");
                  }}
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-form">
                <div className="add-type-selector">
                  <button
                    className={`add-type-btn ${addType === 'image' ? 'active' : ''}`}
                    onClick={() => setAddType('image')}
                  >
                    <FiImage />
                    Image
                  </button>
                  <button
                    className={`add-type-btn ${addType === 'text' ? 'active' : ''}`}
                    onClick={() => setAddType('text')}
                  >
                    <FiType />
                    Text
                  </button>
                </div>

                {addType === 'image' ? (
                  <div className="upload-area">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAddImage}
                      style={{ display: 'none' }}
                    />
                    <button
                      className="btn primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiUpload />
                      Choose Image
                    </button>
                    <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Select an image from your device
                    </p>
                  </div>
                ) : (
                  <div>
                    <label>
                      Text Content
                      <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Enter your text here..."
                        rows={4}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                    </label>
                    <button
                      className="btn primary"
                      onClick={handleAddText}
                      disabled={!newText.trim()}
                    >
                      <FiSave />
                      Add Text
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="modal-overlay" onClick={() => {
            setEditingItem(null);
            setNewText("");
          }}>
            <div className="modal-content moodboard-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit {editingItem.type === 'text' ? 'Text' : 'Image'}</h2>
                <button
                  className="icon-btn-small"
                  onClick={() => {
                    setEditingItem(null);
                    setNewText("");
                  }}
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-form">
                {editingItem.type === 'text' ? (
                  <>
                    <label>
                      Text Content
                      <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        rows={4}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'var(--text-primary)' }}
                      />
                    </label>
                    <div className="form-row">
                      <label>
                        Font Size
                        <input
                          type="range"
                          min="12"
                          max="72"
                          value={editFontSize}
                          onChange={(e) => setEditFontSize(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{editFontSize}px</span>
                      </label>
                      <label>
                        Text Color
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            style={{ width: '60px', height: '40px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'var(--text-primary)' }}
                            placeholder="#090F15"
                          />
                        </div>
                      </label>
                    </div>
                    <div className="modal-actions">
                      <button
                        className="btn primary"
                        onClick={() => {
                          setItems(items.map(item =>
                            item.id === editingItem.id
                              ? { ...item, content: newText, fontSize: editFontSize, color: editColor }
                              : item
                          ));
                          setEditingItem(null);
                          setNewText("");
                        }}
                      >
                        <FiSave />
                        Save Changes
                      </button>
                      <button
                        className="btn ghost"
                        onClick={() => {
                          setEditingItem(null);
                          setNewText("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <img 
                        src={editingItem.content} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', marginBottom: '20px' }}
                      />
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Image editing coming soon. You can resize and rotate using the handles.
                      </p>
                    </div>
                    <div className="modal-actions">
                      <button
                        className="btn ghost"
                        onClick={() => {
                          setEditingItem(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
