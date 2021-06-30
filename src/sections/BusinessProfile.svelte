<script>
    import _ from 'lodash'
    import { navigate } from 'svelte-routing'
    import Swal from 'sweetalert2'
    import Processing from '@/extra/Processing.svelte'
    import ArrowCircleRight from '@/extra/ArrowCircleRight.svelte'
    import ArrowCircleLeft from '@/extra/ArrowCircleLeft.svelte'
    import Gallery from './Gallery.svelte'

    export let baseUrl
    let submitting = false

    const profile = {
        name: '',
        field: '',
        year_start: '',
        employee_number: '',
        revenue: '',
        capital_source: '',
        description: '',
        expectation: '',
        fb: '',
        twitter: '',
        ig: '',
        yt: ''
    }

    function getDataBusinessProfile() {
        fetch(baseUrl + 'business-profile/' +  sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
        .then(response => response.json())
        .then(data => {
            if (data.business !== null) {
                console.log('business profiles', data.business)
                for ( let[key, value] of Object.entries(profile) ) {
                    profile[key] = data.business[key]?? ''
                }
                profile.id = data.business.id?.toString() ?? ''
            }
            console.log('profile', profile)
        })
        
    }

    getDataBusinessProfile()

    function autoUpdateBusiness() {
        const body  = new FormData

        for ( let[key, value] of Object.entries(profile) ) {
            console.log(key, value)
            if ( value.toString().trim() != '' && value !== null ) {
                body.append(key, value)
            }
        }

        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'camp-business-profiles', {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            console.log('getdatabusiness', data)
        })
    }

    function keepDigit(which, string) {
        let value = string.replace(/[^0-9]/g, '')
        if ( value.charAt(0) == '0' ) value = value.substring(1)

        profile[which] = value.trim() != '' ? parseInt(value):''

        return
    }

    function submit() {
        submitting = true
      
        nextStep()
    }

    function nextStep() {
        fetch(baseUrl + 'next-step/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            console.log('nextStep', data)
            if ( data.step < 4 ) {
                Swal.fire({
                    title: 'Data Belum Lengkap',
                    text: 'Silakan lengkapi kolom yang harus diisi!',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#3984fb'
                })

                submitting = false
                return
            } else {
                navigate('/data-lainnya')
            }
        })
        .catch(err => {
            submitting = false

            setTimeout(() => {
                submitting = false
                Swal.fire({
                    title: 'Gagal',
                    text: 'Pastikan koneksi internet anda stabil!',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#3984fb'
                })
            }, 2000);
        })
    }



</script>

<div class="my-4 border md:rounded md:border-blue-300">
    <div class="w-full p-2 bg-blue-300 font-bold text-white text-center md:font-medium md:text-lg md:rounded-t lg:text-3xl">Data Mengenai Usaha/Bisnis yang Sedang Dijalani</div>

    <div class="text-xs p-2 md:text-sm md:px-6 lg:px-8 lg:text-base lg:grid lg:grid-cols-3 lg:gap-y-2">
        <div class="p-2 lg:col-span-3 text-xs text-red-500">*Harus diisi</div>
        <div class="p-2 font-medium lg:col-span-1">Nama Usaha<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span></div>
        <input type="text" class="border p-2 w-full md:rounded lg:col-span-2 {profile.name.trim() == '' ? 'border-red-500':'border-blue-300'}" bind:value="{profile.name}" on:change="{autoUpdateBusiness}">
        <div class="p-2 font-medium lg:col-span-1">Bidang Usaha<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span></div>
        <select class="bg-white p-2 border w-full md:rounded lg:col-span-2 {profile.field.trim() == '' ? 'border-red-500':'border-blue-300'}" bind:value="{profile.field}" on:blur="{autoUpdateBusiness}">
            <option value="">Pilih Bidang</option>
            <option value="fesyen">Fesyen</option>
            <option value="kriya">Kriya</option>
        </select>
        <div class="p-2 font-medium lg:col-span-1">Tahun Berdiri<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span></div>
        <input type="text" maxlength="4" class="border p-2 w-full md:rounded lg:col-span-2 {profile.year_start.toString().trim() == '' ? 'border-red-500':'border-blue-300'}" bind:value="{profile.year_start}" on:input="{e => keepDigit('year_start', e.target.value)}" on:change="{autoUpdateBusiness}">

        <div class="p-2 font-medium lg:col-span-1">Jumlah Pegawai Tetap<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span> <span class="text-xs font-light">(minimal 1 tahun kerja)</span></div>
        <input type="text" class="p-2 border w-full md:rounded lg:col-span-2 {profile.employee_number.toString().trim() == '' ? 'border-red-500':'border-blue-300'}" bind:value="{profile.employee_number}" on:input="{e => keepDigit('employee_number', e.target.value)}" on:change="{autoUpdateBusiness}">

        <div class="p-2 font-medium lg:col-span-1">Omset Usaha per Tahun<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span></div>
        <input type="text" class="border p-2 w-full md:rounded lg:col-span-2 {profile.revenue.toString().trim() == '' ? 'border-red-500':'border-blue-300'}" bind:value="{profile.revenue}" on:input="{e => keepDigit('revenue', e.target.value)}" on:change="{autoUpdateBusiness}">

        <div class="p-2 font-medium lg:col-span-1">Sumber Pendanaan Modal Awal<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span></div>
        <input type="text" class="border p-2 w-full md:rounded lg:col-span-2 {profile.capital_source.trim() == '' ? 'border-red-500':'border-blue-300'}" bind:value="{profile.capital_source}" on:change="{autoUpdateBusiness}">

        <div class="p-2 font-medium lg:col-span-3 lg:">Penjelasan Singkat Usaha<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span></div>
        <textarea rows="1" class="p-2 w-full border md:rounded lg:h-40 lg:col-span-3 lg:-mt-3 {profile.description.trim() == '' ? 'border-red-500':'border-blue-300'}" bind:value="{profile.description}" on:change="{autoUpdateBusiness}"></textarea>
        <div class="p-2 font-medium lg:col-span-3">Ekspektasi Terhadap Usaha Anda Setelah Menjalani Program BCIC<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span></div>

        <textarea rows="1" class="p-2 w-full border md:rounded lg:h-40 lg:col-span-3 lg:-mt-3 {profile.expectation.trim() == '' ? 'border-red-500':'border-blue-300'}" bind:value="{profile.expectation}" on:change="{autoUpdateBusiness}"></textarea>

        <div class="p-2 font-medium lg:col-span-3">Gambar Contoh Produk Anda<span class="text-red-500 text-xs font-light lg:text-sm xl:text-base">*</span></div>

        <Gallery {baseUrl}/>

    </div>

</div>


<div class="p-2 flex justify-between">
    
    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{() => navigate('/pengalaman-kerja-dan-organisasi')}"><ArrowCircleLeft/> Sebelumnya</button>

    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{submit}">Lanjutkan <ArrowCircleRight/></button>
</div>

{#if submitting}
<Processing/>
{/if}