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
  FiMove,
  FiPlus,
  FiMaximize2,
  FiRotateCw,
  FiZoomIn,
  FiZoomOut
} from "react-icons/fi";

export default function Documents() {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(`moodboard_${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState("image");
  const [newText, setNewText] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState("");
  const [editFontSize, setEditFontSize] = useState(24);
  const [editColor, setEditColor] = useState("#090F15");
  const [draggedItem, setDraggedItem] = useState(null);
  const [resizingItem, setResizingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`moodboard_${user?.id}`, JSON.stringify(items));
    }
  }, [items, user?.id]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleWheelResize = (e, item) => {
    e.preventDefault();
    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setItems(items.map(i => 
      i.id === item.id 
        ? { ...i, width: Math.max(50, i.width * scaleFactor), height: Math.max(50, i.height * scaleFactor) }
        : i
    ));
  };

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

  const handleAddItem = () => {
    if (addType === "text" && newText.trim()) {
      handleAddText();
    } else if (addType === "image" && newImageUrl.trim()) {
      const newItem = {
        id: Date.now(),
        type: "image",
        url: newImageUrl,
        x: Math.random() * 300,
        y: Math.random() * 200,
        width: 200,
        height: 200,
        rotation: 0,
        zIndex: items.length
      };
      setItems([...items, newItem]);
      setNewImageUrl("");
      setShowAddModal(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    if (item.type === 'text') {
      setEditText(item.content);
      setEditFontSize(item.fontSize || 24);
      setEditColor(item.color || '#090F15');
    }
  };

  const handleSaveEdit = () => {
    if (editingItem.type === 'text') {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, content: editText, fontSize: editFontSize, color: editColor }
          : item
      ));
    }
    setEditingItem(null);
    setEditText("");
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleStartDrag = (e, item) => {
    e.preventDefault();
    setDraggedItem({ ...item, offsetX: e.clientX - item.x, offsetY: e.clientY - item.y });
    setSelectedItem(item);
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

      if (direction.includes('right')) newWidth = Math.max(50, startWidth + deltaX);
      if (direction.includes('left')) newWidth = Math.max(50, startWidth - deltaX);
      if (direction.includes('bottom')) newHeight = Math.max(50, startHeight + deltaY);
      if (direction.includes('top')) newHeight = Math.max(50, startHeight - deltaY);

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
    const startRotation = item.rotation || 0;

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

  const handleZoom = (item, direction) => {
    const scaleFactor = direction === 'in' ? 1.1 : 0.9;
    setItems(items.map(i => 
      i.id === item.id 
        ? { ...i, width: Math.max(50, i.width * scaleFactor), height: Math.max(50, i.height * scaleFactor) }
        : i
    ));
  };

  const handleBringToFront = (item) => {
    const maxZ = Math.max(...items.map(i => i.zIndex || 0));
    setItems(items.map(i => 
      i.id === item.id ? { ...i, zIndex: maxZ + 1 } : i
    ));
  };

  const handleDuplicate = (item) => {
    const newItem = {
      ...item,
      id: Date.now(),
      x: item.x + 20,
      y: item.y + 20,
      zIndex: Math.max(...items.map(i => i.zIndex || 0)) + 1
    };
    setItems([...items, newItem]);
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
            {selectedItem && (
              <div className="selected-item-controls" style={{
                display: 'flex', 
                gap: '12px', 
                marginRight: '20px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                alignItems: 'center'
              }}>
                <span style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginRight: '8px',
                  opacity: 0.8
                }}>
                  Selected Item
                </span>
                <button
                  className="moodboard-top-btn"
                  onClick={() => handleEditItem(selectedItem)}
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  className="moodboard-top-btn"
                  onClick={() => handleZoom(selectedItem, 'in')}
                  title="Zoom In"
                >
                  <FiZoomIn />
                </button>
                <button
                  className="moodboard-top-btn"
                  onClick={() => handleZoom(selectedItem, 'out')}
                  title="Zoom Out"
                >
                  <FiZoomOut />
                </button>
                <button
                  className="moodboard-top-btn"
                  onClick={(e) => handleRotate(e, selectedItem)}
                  title="Rotate"
                >
                  <FiRotateCw />
                </button>
                <button
                  className="moodboard-top-btn"
                  onClick={() => handleDuplicate(selectedItem)}
                  title="Duplicate"
                >
                  <FiPlus />
                </button>
                <button
                  className="moodboard-top-btn"
                  onClick={() => handleBringToFront(selectedItem)}
                  title="Bring to Front"
                >
                  <FiMaximize2 />
                </button>
                <button
                  className="moodboard-top-btn delete-btn"
                  onClick={() => {
                    handleDelete(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
                <button
                  className="moodboard-top-btn close-btn"
                  onClick={() => setSelectedItem(null)}
                  title="Deselect"
                >
                  <FiX />
                </button>
              </div>
            )}
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
                  className={`moodboard-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    transform: `rotate(${item.rotation || 0}deg)`,
                    zIndex: item.zIndex || 0
                  }}
                  onMouseDown={(e) => handleStartDrag(e, item)}
                  onClick={() => handleItemClick(item)}
                  onWheel={(e) => selectedItem?.id === item.id ? handleWheelResize(e, item) : undefined}
                >
                  {item.type === 'image' ? (
                    <img src={item.url || item.content} alt="Moodboard" className="moodboard-image" 
                         style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block'}} />
                  ) : (
                    <div 
                      className="moodboard-text"
                      style={{
                        fontSize: `${item.fontSize}px`,
                        color: item.color,
                        fontFamily: item.fontFamily || 'Inter',
                        padding: '10px',
                        wordWrap: 'break-word',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      {item.content}
                    </div>
                  )}
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
                    <div 
                      className="resize-handle resize-top"
                      onMouseDown={(e) => handleResize(e, item, 'top')}
                    />
                    <div 
                      className="resize-handle resize-bottom"
                      onMouseDown={(e) => handleResize(e, item, 'bottom')}
                    />
                    <div 
                      className="resize-handle resize-left"
                      onMouseDown={(e) => handleResize(e, item, 'left')}
                    />
                    <div 
                      className="resize-handle resize-right"
                      onMouseDown={(e) => handleResize(e, item, 'right')}
                    />
                  </div>
                  
                  {/* Edge resize zones - larger areas for easier resizing */}
                  <div className="resize-zone resize-top-zone" onMouseDown={(e) => handleResize(e, item, 'top')} />
                  <div className="resize-zone resize-bottom-zone" onMouseDown={(e) => handleResize(e, item, 'bottom')} />
                  <div className="resize-zone resize-left-zone" onMouseDown={(e) => handleResize(e, item, 'left')} />
                  <div className="resize-zone resize-right-zone" onMouseDown={(e) => handleResize(e, item, 'right')} />
                  <div className="resize-zone resize-top-left-zone" onMouseDown={(e) => handleResize(e, item, 'top-left')} />
                  <div className="resize-zone resize-top-right-zone" onMouseDown={(e) => handleResize(e, item, 'top-right')} />
                  <div className="resize-zone resize-bottom-left-zone" onMouseDown={(e) => handleResize(e, item, 'bottom-left')} />
                  <div className="resize-zone resize-bottom-right-zone" onMouseDown={(e) => handleResize(e, item, 'bottom-right')} />
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
                        onClick={handleSaveEdit}
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
