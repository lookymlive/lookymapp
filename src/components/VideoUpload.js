import React, { useState } from 'react';

function VideoUpload() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            const token = localStorage.getItem('token'); // Asume que guardas el token en localStorage
            const response = await fetch('/api/videos/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': token
                }
            });
            if (response.ok) {
                console.log('Video subido con éxito');
            } else {
                console.error('Error al subir el video');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
            <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button type="submit">Subir Video</button>
        </form>
    );
}

export default VideoUpload;
