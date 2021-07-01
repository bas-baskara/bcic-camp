<script>
    import { navigate } from 'svelte-routing'
    import Swal from 'sweetalert2'
    import Processing from '@/extra/Processing.svelte'
    import ArrowCircleRight from '@/extra/ArrowCircleRight.svelte'

    export let baseUrl
    
    const biodata = {
        id: null,
        photo: '',
        name: '',
        sex: '',
        dob: '',
        pob:'',
        nik: '',
        address: '',
        domicile: '',
        phone: '',
        phone2: '',
        email: '',
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: ''
    }

    const business = {
        fb: '',
        twitter: '',
        ig: '',
        yt: ''
    }
    let src, submitting

    fetch(baseUrl + 'biodata/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
    .then(response => response.json())
    .then(data => {
        console.log('biodata', data)
        for ( let[key, value] of Object.entries(data.user) ) {
            if (key in biodata) {
                if ( value === null ) {
                    biodata[key] = ''
                } else {
                    biodata[key] = value
                }
            }
        }

        src = baseUrl + 'photo-registrant/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar

    })

    fetch(baseUrl + 'business-profile/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
    .then(response => response.json())
    .then(data => {
        console.log('business profile', data)

        if ( data.business !== null ) {
            for ( let[key,value] of Object.entries(data.business) ) {
                if ( key in business ) {
                    if ( value === null ) {
                        business[key] = ''
                    } else {
                        business[key] = value
                    }
                }
            }
        }
    })

    //
    function sendPhoto(file) {
        const body = new FormData
        body.append('photo', file)
        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'update-photo/' + biodata.id, {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            console.log('sendPhoto response', data)

        })
    }
    
    function dDate(date) {
        return date.getDate() < 10 ? '0' + date.getDate():date.getDate().toString()
    }

    const monthString = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

        
    function birthDate(date) {        
        return dDate(date) + ' ' + monthString[date.getMonth()] + ' ' + date.getFullYear()
    }
    
    function uploadPhoto(e) {
        const reader = new FileReader
        const file = e.target.files[0]

        reader.onload = (event) => {
            biodata.photo = event.target.result
        }

        reader.readAsDataURL(file)
        sendPhoto(file)
    }

    function autoUpdate(e, which) {
        const body = new FormData
        body.append('field', which)
        body.append('value', biodata[which])
        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'update-biodata/' + biodata.id, {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => console.log(data))
    }

    function keepDigit(e, which) {
        biodata[which] = e.target.value.replace(/[^0-9]/g, '')
    }

    function autoUpdateBusiness(e, which) {
        const body = new FormData
        body.append(which, business[which])
        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'camp-business-profiles', {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => console.log(data))

    }

    function submit() {
        submitting = true
        const optional = ['id', 'phone2', 'email', 'domicile', 'facebook', 'twitter', 'instagram', 'youtube']

        for ( let[key, value] of Object.entries(biodata) ) {
            if ( !optional.includes(key) ) {
                if (key == 'nik') {
                    if (value.trim().length < 16) {
                        Swal.fire({
                            title: 'Data Belum Lengkap',
                            text: 'Silakan lengkapi kolom yang harus diisi!',
                            icon: 'error',
                            confirmButtonText: 'Ok',
                            confirmButtonColor: '#3984fb'
                        })
                        submitting = false
                        return

                    }
                } else if ( value.trim() == '' ) {
                    Swal.fire({
                        title: 'Data Belum Lengkap',
                        text: 'Silakan lengkapi kolom yang harus diisi!',
                        icon: 'error',
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#3984fb'
                    })
                    submitting = false
                    return
                }
            }
        }
        
        nextStep()

    }

    function nextStep() {
        fetch(baseUrl + 'next-step/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            console.log('nextStep', data)
            if ( data.status == 'ok' ) navigate('/camp-bcic/form/pendidikan-dan-pencapaian')
        })
        .catch(err => {
                Swal.fire({
                    title: 'Gagal',
                    text: 'Pastikan koneksi internet anda stabil!',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#3984fb'
                })
                submitting = false

            setTimeout(() => {
                location.reload()
            }, 2000);
        })
    }
    
</script>


<div class="my-4 border md:rounded md:border-blue-300">
    <div class="w-full p-2 bg-blue-300 text-white text-center md:font-medium md:text-lg md:rounded-t lg:text-3xl">Biodata</div>

    <div class="p-2 flex justify-center">
        <label for="upload-photo" class="{biodata.photo == '' ? 'border-2 border-dotted border-red-300  h-40 lg:h-60':''} w-36 flex items-center justify-center text-gray-500 cursor-pointer lg:w-52">
            {#if biodata.photo !== ''}
            <img class="w-full" {src} alt="">
            {:else}
            <div class="text-center text-xs lg:text-sm">
                Upload Foto Close Up<br><span class="text-xs">(wajib diisi)</span>
            </div>
            {/if}
        </label>
        <input id="upload-photo" type="file" class="hidden" accept=".jpg,.jpeg,png" on:input="{uploadPhoto}">
    </div>


    <div class="text-sm p-2 space-y-2 pb-12 md:px-4 md:text-base lg:px-6 lg:space-y-6">
        <div>
            <div class="font-medium py-2 md:px-1">Nama Lengkap<span class="text-red-500">*</span>:</div>
            <input type="text" class="p-2 w-full border rounded {biodata.name.trim() == '' ? 'border-red-300':'border-blue-300'}" bind:value="{biodata.name}" on:change="{e => autoUpdate(e, 'name')}">
        </div>

        <div>
            <div class="font-medium py-2 md:px-1">Jenis Kelamin<span class="text-red-500">*</span>:</div>
            <select id="sex" class="p-2 border rounded min-w-1/4 bg-white {biodata.sex.trim() == '' ? 'border-red-300':'border-blue-300'}" bind:value="{biodata.sex}" on:blur="{e => autoUpdate(e, 'sex')}">
                <option value="perempuan">Perempuan</option>                
                <option value="laki-laki">Laki-laki</option>                
            </select>
        </div>

        <div>
            <div class="font-medium py-2 md:px-1">Tempat dan Tanggal Lahir<span class="text-red-500">*</span>:</div>
            <div class="flex flex-wrap items-center gap-2">
                <input type="text" bind:value="{biodata.pob}" class="border rounded p-2 {biodata.pob.trim() == '' ? 'border-red-300':'border-blue-300'}" placeholder="tempat kelahiran" on:change="{e => autoUpdate(e, 'pob')}">
                <div class="grid">
                    <div id="tanggal-survey" class="py-2 px-4 rounded border col-start-1 col-end-1 row-start-1 row-end-1 {biodata.dob.trim() == '' ? 'border-red-300':'border-blue-300'}">{ biodata.dob == '' ? 'Tanggal Lahir':birthDate(new Date(biodata.dob)) }</div>
                    <input type="date" class="col-start-1 col-end-1 row-start-1 row-end-1 z-10 opacity-0" bind:value="{biodata.dob}" on:change="{e => autoUpdate(e, 'dob')}">
                </div>

            </div>
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">N.I.K<span class="text-red-500">*</span>:</div>
            <input type="text" class="p-2 w-full border rounded {biodata.nik.trim().length < 16 ? 'border-red-300':'border-blue-300'}" maxlength="16" bind:value="{biodata.nik}" on:input="{e => keepDigit(e, 'nik')}" on:change="{e => autoUpdate(e, 'nik')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Alamat Sesuai KTP<span class="text-red-500">*</span>:</div>
            <input type="text" class="p-2 w-full border rounded {biodata.address.trim() == '' ? 'border-red-300':'border-blue-300'}" bind:value="{biodata.address}" on:change="{e => autoUpdate(e, 'address')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Alamat Tinggal (Bila Berbeda Dengan Data KTP):</div>
            <input type="text" class="p-2 w-full border rounded" bind:value="{biodata.domicile}" on:change="{e => autoUpdate(e, 'domicile')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Nomor Telepon 1<span class="text-red-500">*</span>:</div>
            <input type="text" class="p-2 w-full border rounded {biodata.phone.trim() == '' ? 'border-red-300':'border-blue-300'}" maxlength="14" bind:value="{biodata.phone}" on:input="{e => keepDigit(e, 'phone')}" on:change="{e => autoUpdate(e, 'phone')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Nomor Telepon 2:</div>
            <input type="text" class="p-2 w-full border rounded" maxlength="14" bind:value="{biodata.phone2}" on:input="{e => keepDigit(e, 'phone2')}" on:change="{e => autoUpdate(e, 'phone2')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Email<span class="text-red-500">*</span>:</div>
            <input type="text" class="p-2 w-full border rounded bg-gray-100 {biodata.email.trim() == '' ? 'border-red-300':'border-blue-300'}" readonly bind:value="{biodata.email}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Akun Facebook (Pribadi):</div>
            <input type="text" class="p-2 w-full border rounded {biodata.facebook.trim() == '' ? '':'border-blue-300'}" bind:value="{biodata.facebook}" on:change="{e => autoUpdate(e, 'facebook')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Akun Instagram (Pribadi):</div>
            <input type="text" class="p-2 w-full border rounded {biodata.instagram.trim() == '' ? '':'border-blue-300'}" bind:value="{biodata.instagram}" on:change="{e => autoUpdate(e, 'instagram')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Akun Twitter (Pribadi):</div>
            <input type="text" class="p-2 w-full border rounded {biodata.twitter.trim() == '' ? '':'border-blue-300'}" bind:value="{biodata.twitter}" on:change="{e => autoUpdate(e, 'twitter')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Channel Youtube(Pribadi):</div>
            <input type="text" class="p-2 w-full border rounded {biodata.youtube.trim() == '' ? '':'border-blue-300'}" bind:value="{biodata.youtube}" on:change="{e => autoUpdate(e, 'youtube')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Akun Facebook (Bisnis):</div>
            <input type="text" class="p-2 w-full border rounded {business.fb.trim() == '' ? '':'border-blue-300'}" bind:value="{business.fb}" on:change="{e => autoUpdateBusiness(e, 'fb')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Akun Instagram (Bisnis):</div>
            <input type="text" class="p-2 w-full border rounded {business.ig.trim() == '' ? '':'border-blue-300'}" bind:value="{business.ig}" on:change="{e => autoUpdateBusiness(e, 'ig')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Akun Twitter (Bisnis):</div>
            <input type="text" class="p-2 w-full border rounded {business.twitter.trim() == '' ? '':'border-blue-300'}" bind:value="{business.twitter}" on:change="{e => autoUpdateBusiness(e, 'twitter')}">
        </div>
        <div>
            <div class="font-medium py-2 md:px-1">Channel Youtube(Bisnis):</div>
            <input type="text" class="p-2 w-full border rounded {business.yt.trim() == '' ? '':'border-blue-300'}" bind:value="{business.yt}" on:change="{e => autoUpdateBusiness(e, 'yt')}">
        </div>
    </div>
    <div class="text-red-500 px-6 py-2">* <span class="text-xs ">Kolom tidak boleh kosong</span></div>
</div>

<div class="p-2 flex justify-end">
    
    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{submit}">Lanjutkan <ArrowCircleRight/></button>
</div>

{#if submitting}
<Processing/>
{/if}