<script>
    import Logout from '@/extra/Logout.svelte';


</script>

<div class="w-full flex justify-between items-center p-2">
    <img class="w-20 md:w-28" src="/assets/bcic.png" alt="BCIC">
    <img class="w-24 md:w-36" src="/assets/logo-kemenperin.svg" alt="BCIC">
</div>

<div class="w-full p-2 flex flex-col items-end justify-end" id="keluar">
    <div class="flex items-center gap-1 text-xs border rounded px-1 py-1 text-gray-700 cursor-pointer hover:text-black hover:bg-gray-200 active:text-white active:bg-gray-700 md:text-sm md:py-1 md:px-3 lg:text-base lg:py-2 xl:px-4 xl:py-1.5" on:click="{() => {sessionStorage.clear();location.href="/"} }">
        Keluar
        <Logout elClass="w-4 h-4"/>
    </div>

    <div class="-mt-1 flex justify-end invisible">
        <div class="font-light p-1 text-xs">Keluar dan Simpan</div>
    
    </div>
</div>

<div class="p-2 mt-2 text-center text-sm font-bold md:mt-6 md:text-xl lg:text-3xl">Formulir Pendaftaran Seleksi Peserta Program Creative Business Incubator (CBI) 2021</div>

<p class="p-2 text-xs text-justify md:text-base lg:py-4">Isi formulir dibawah ini dengan lengkap. Semua jawaban
yang anda berikan, akan diverifikasi pada proses interview, termasuk untuk membawa bukti
portofolio hasil rancangan anda.
</p>
