import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function UpdateProfileForm() {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email] = useState(user?.email || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    user?.avatar
      ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}/storage/${user.avatar}`
      : user?.avatar_url || null
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  // Pilih foto baru
  const onPickPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  // Simpan perubahan profil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      // 1️⃣ Update nama
      await api.put("/profile", { full_name: fullName });

      // 2️⃣ Upload foto baru (kalau ada)
      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile); // name harus "photo"
        await api.post("/profile/photo", formData); // hapus headers apa pun
      }

      // 3️⃣ Refresh user data
      const { data } = await api.get("/me");
      setUser?.(data?.user || data);

      alert("✅ Profil berhasil diperbarui");
    } catch (error) {
      console.error("Update failed:", error);

      if (error.response?.status === 422) {
        setErrors(error.response.data?.errors || { message: error.response.data?.message });
      } else {
        alert("❌ Gagal menyimpan profil. Cek log server Laravel.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <img
          src={photoPreview || "/default-avatar.png"}
          alt="avatar"
          className="h-20 w-20 rounded-full object-cover border"
        />
        <label className="text-blue-600 cursor-pointer">
          Ubah Foto
          <input type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        </label>
      </div>

      <div>
        <label className="block text-sm mb-1">Nama Lengkap</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {errors?.full_name && <p className="text-red-600 text-sm">{errors.full_name[0]}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          className="w-full border rounded px-3 py-2 bg-gray-100"
          value={email}
          disabled
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded py-2"
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
