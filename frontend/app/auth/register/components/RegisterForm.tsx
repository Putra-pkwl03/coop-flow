"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Upload, FolderOpen } from "lucide-react";
import api from "../../../lib/axios";
import Swal from "sweetalert2";

export default function RegisterForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref untuk mereset input file secara fisik
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  // State khusus untuk menampung file biner berkas perizinan
  const [legalFile, setLegalFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false); // 🆕 State untuk efek drag & drop

  const [formData, setFormData] = useState({
    cooperative_name: "",
    nib_cooperative: "", // 🆕 Menggantikan nik_cooperative
    legal_approval_number: "", // 🆕 Menggantikan legal_entity_number
    established_date: "",
    npwp: "",
    address_cooperative: "",
    postal_code: "",
    province_id: "",
    city_id: "",
    district_id: "",
    village_id: "",
    email_cooperative: "",
    phone_cooperative: "",
    capacity_ton: "",
    password: "",
    password_confirmation: "",
  });

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  useEffect(() => {
    api
      .get("/regional/provinces")
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Error Fetching Provinces:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handler khusus untuk mendeteksi perubahan input file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLegalFile(e.target.files[0]);
    }
  };

  // 🆕 Handler untuk fitur drag & drop file
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setLegalFile(file);

      // Sinkronkan file yang di-drop ke input asli agar tetap konsisten
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRegionChange = async (type: string, code: string) => {
    if (type === "province") {
      setFormData((prev) => ({
        ...prev,
        province_id: code,
        city_id: "",
        district_id: "",
        village_id: "",
      }));
      setCities([]);
      setDistricts([]);
      setVillages([]);
      if (code) {
        const res = await api.get(`/regional/provinces/${code}/cities`);
        setCities(res.data);
      }
    } else if (type === "city") {
      setFormData((prev) => ({
        ...prev,
        city_id: code,
        district_id: "",
        village_id: "",
      }));
      setDistricts([]);
      setVillages([]);
      if (code) {
        const res = await api.get(`/regional/cities/${code}/districts`);
        setDistricts(res.data);
      }
    } else if (type === "district") {
      setFormData((prev) => ({ ...prev, district_id: code, village_id: "" }));
      setVillages([]);
      if (code) {
        const res = await api.get(`/regional/districts/${code}/villages`);
        setVillages(res.data);
      }
    } else if (type === "village") {
      setFormData((prev) => ({ ...prev, village_id: code }));
    }
  };

  const generateCooperativeCode = (name: string) => {
    const initials = name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 4);

    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);

    return `KOP-${initials}-${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Password
    if (formData.password !== formData.password_confirmation) {
      Toast.fire({
        icon: "warning",
        title: "Konfirmasi password tidak cocok!",
      });
      return;
    }

    // 2. Validasi Panjang NIB (Wajib 13 Digit)
    if (formData.nib_cooperative.length !== 13) {
      Toast.fire({
        icon: "warning",
        title: "Nomor Induk Berusaha (NIB) harus tepat 13 digit!",
      });
      return;
    }

    // 3. Validasi Keberadaan Berkas Dokumen
    if (!legalFile) {
      Toast.fire({
        icon: "warning",
        title: "Dokumen Persetujuan Hukum wajib diunggah!",
      });
      return;
    }

    setLoading(true);

    const provinceName =
      provinces.find((p: any) => p.code === formData.province_id)?.name || "";
    const cityName =
      cities.find((c: any) => c.code === formData.city_id)?.name || "";
    const districtName =
      districts.find((d: any) => d.code === formData.district_id)?.name || "";
    const villageName =
      villages.find((v: any) => v.code === formData.village_id)?.name || "";

    // 🔥 STRATEGI BARU: Menggunakan FormData untuk kebutuhan Upload File Biner
    const formDataPayload = new FormData();

    formDataPayload.append("cooperative_name", formData.cooperative_name);
    formDataPayload.append(
      "cooperative_code",
      generateCooperativeCode(formData.cooperative_name),
    );
    formDataPayload.append("nib_cooperative", formData.nib_cooperative);
    formDataPayload.append("npwp", formData.npwp);
    formDataPayload.append(
      "legal_approval_number",
      formData.legal_approval_number,
    );
    formDataPayload.append("established_date", formData.established_date);
    formDataPayload.append("address_cooperative", formData.address_cooperative);
    formDataPayload.append("email_cooperative", formData.email_cooperative);
    formDataPayload.append("phone_cooperative", formData.phone_cooperative);
    formDataPayload.append("postal_code", formData.postal_code);
    formDataPayload.append("province", provinceName);
    formDataPayload.append("city_koor", cityName);
    formDataPayload.append("district", districtName);
    formDataPayload.append("village", villageName);
    formDataPayload.append("capacity_ton", formData.capacity_ton);
    formDataPayload.append("password", formData.password);

    // Append file biner ke dalam payload FormData
    formDataPayload.append("legal_approval_document", legalFile);

    try {
      // ✅ PERBAIKAN 1: Hapus manual headers "Content-Type", biarkan Axios yang mengatur otomatis
      // Ubah bagian ini:
      const response = await api.post(
        "/cooperative/register",
        formDataPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const successMessage =
        response.data?.message || "Registrasi Koperasi sukses diajukan!";

      Toast.fire({
        icon: "success",
        title: successMessage,
      });

      router.push("/auth/login");
    } catch (err: any) {
      console.error("Full response data:", err.response?.data);

      let errorMsg = "Gagal registrasi, periksa kembali input data.";

      // ✅ PERBAIKAN 2: Tangkap error 422 dari Laravel Validations
      if (err.response && err.response.data) {
        if (err.response.status === 422) {
          const errors = err.response.data;
          const firstErrorKey = Object.keys(errors)[0];
          errorMsg = errors[firstErrorKey][0]; // Ambil pesan error validasi pertama
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }

      Toast.fire({
        icon: "error",
        title: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      cooperative_name: "",
      nib_cooperative: "",
      legal_approval_number: "",
      established_date: "",
      npwp: "",
      address_cooperative: "",
      postal_code: "",
      province_id: "",
      city_id: "",
      district_id: "",
      village_id: "",
      email_cooperative: "",
      phone_cooperative: "",
      capacity_ton: "",
      password: "",
      password_confirmation: "",
    });
    setLegalFile(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Bersihkan tampilan input file secara fisik
  };

  const inputClass =
    "border border-gray-300 p-3.5 rounded-lg w-full text-base text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500";
  const labelClass = "block text-base font-semibold mb-2 text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama Koperasi & NIB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Nama Koperasi <span className="text-red-500">*</span>
          </label>
          <input
            name="cooperative_name"
            placeholder="Contoh : Koperasi Tani Makmur"
            value={formData.cooperative_name}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Nomor Induk Berusaha (NIB) <span className="text-red-500">*</span>
          </label>
          <input
            name="nib_cooperative"
            placeholder="Masukan 13 digit NIB Koperasi"
            value={formData.nib_cooperative}
            // Memastikan user hanya bisa memasukkan angka dengan panjang max 13 digit
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 13);
              setFormData((prev) => ({ ...prev, nib_cooperative: val }));
            }}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Upload Berkas Dokumen & Nomor Berkas Dokumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Upload Berkas / SK Pendirian <span className="text-red-500">*</span>
          </label>

          {/* 🆕 Dropzone kustom menggantikan input file bawaan */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-between gap-4 border-2 border-dashed rounded-lg p-4 cursor-pointer transition
              ${
                isDragging
                  ? "border-green-500 bg-green-50/60"
                  : "border-gray-300 bg-gray-50/60 hover:border-green-400"
              }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="shrink-0 bg-green-50 text-green-600 rounded-lg p-3">
                <Upload size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-base text-black truncate">
                  <span className="font-semibold">Pilih file</span> atau seret
                  &amp; lepas file di sini
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Format dokumen: PDF, JPG, JPEG, PNG
                  <br />
                  Maksimal ukuran file: 2MB
                </p>
                {legalFile && (
                  <p className="text-xs text-green-700 font-medium mt-1 truncate">
                    Berkas dipilih: {legalFile.name}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="shrink-0 flex items-center gap-2 border border-green-200 bg-green-50 text-green-700 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-green-100 transition whitespace-nowrap"
            >
              <FolderOpen size={16} />
              Pilih File
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              required={!legalFile}
            />
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Format dokumen: PDF, JPG, JPEG, PNG (Maksimal ukuran file: 2MB)
          </p>
        </div>
        <div>
          <label className={labelClass}>
            Nomor SK / Pendaftaran Hukum <span className="text-red-500">*</span>
          </label>
          <input
            name="legal_approval_number"
            placeholder="Contoh : AHU-876345S-835 Tahun 2026"
            value={formData.legal_approval_number}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Tanggal Berdiri & NPWP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Tanggal Berdiri <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="established_date"
            value={formData.established_date}
            onChange={handleChange}
            className={`${inputClass} ${formData.established_date ? "text-black" : "text-gray-400"}`}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            NPWP Koperasi <span className="text-red-500">*</span>
          </label>
          <input
            name="npwp"
            placeholder="Contoh : 6296-8346-93935"
            value={formData.npwp}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Alamat & Kode Pos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Alamat Koperasi <span className="text-red-500">*</span>
          </label>
          <input
            name="address_cooperative"
            placeholder="Masukan Alamat koperasi lengkap"
            value={formData.address_cooperative}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Kode Pos <span className="text-red-500">*</span>
          </label>
          <input
            name="postal_code"
            placeholder="Masukan Kode Pos"
            value={formData.postal_code}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Provinsi & Kabupaten/Kota */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Provinsi <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.province_id}
            onChange={(e) => handleRegionChange("province", e.target.value)}
            className={`${inputClass} ${formData.province_id ? "text-black" : "text-gray-400"}`}
            required
          >
            <option value="">Pilih Provinsi</option>
            {provinces.map((p: any) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Kabupaten/Kota <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.city_id}
            onChange={(e) => handleRegionChange("city", e.target.value)}
            className={`${inputClass} ${formData.city_id ? "text-black" : "text-gray-400"}`}
            required
          >
            <option value="">Pilih Kabupaten/Kota</option>
            {cities.map((c: any) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kecamatan & Desa/Kelurahan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Kecamatan <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.district_id}
            onChange={(e) => handleRegionChange("district", e.target.value)}
            className={`${inputClass} ${formData.district_id ? "text-black" : "text-gray-400"}`}
            required
          >
            <option value="">Pilih Kecamatan</option>
            {districts.map((d: any) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Desa/Kelurahan <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.village_id}
            onChange={(e) => handleRegionChange("village", e.target.value)}
            className={`${inputClass} ${formData.village_id ? "text-black" : "text-gray-400"}`}
            required
          >
            <option value="">Pilih Desa/Kelurahan</option>
            {villages.map((v: any) => (
              <option key={v.code} value={v.code}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Email, No. Telepon, Kapasitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>
            Email Koperasi <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email_cooperative"
            placeholder="admin@gmail.com"
            value={formData.email_cooperative}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            No. Telepon Koperasi <span className="text-red-500">*</span>
          </label>
          <input
            name="phone_cooperative"
            placeholder="08xxxxxxxxxx"
            value={formData.phone_cooperative}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Kapasitas Penyimpanan Gudang (Ton){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="capacity_ton"
            placeholder="Contoh : 200"
            value={formData.capacity_ton}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Password & Konfirmasi Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Masukan Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Masukan password"
              value={formData.password}
              onChange={handleChange}
              className={`${inputClass} pr-10`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>
            Konfirmasi Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswordConfirmation ? "text" : "password"}
              name="password_confirmation"
              placeholder="Konfirmasi password"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={`${inputClass} pr-10`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirmation((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPasswordConfirmation ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tombol Batal & Kirim */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-300 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Kirim"}
        </button>
      </div>
    </form>
  );
}
