<script>
    import Masonry from 'masonry-layout'
    import imagesLoaded from 'imagesloaded'
    import PlusCircle from '@/extra/PlusCircle.svelte'
    import XIcon from '@/extra/XIcon.svelte'
    import Swal from 'sweetalert2'
    import { onMount } from 'svelte';

    export let baseUrl
    let grid, uploadProduct, imageFile, submitting = false
    let images = []
    let progress = '0%'
    
    const getImages = (function() {
        fetch(baseUrl + 'get-product-images/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
        .then(response => response.json())   
        .then(data => {
            console.log('data', data)
            images = data

            setTimeout(() => {
                getMasonry()
            }, 2000);
        })
    })

    const getMasonry = (function() {
        const msnry = new Masonry( grid, {
        itemSelector: '.mason-grid-item',
        columnWidth: '.mason-grid-sizer',
        percentPosition: true
        });
    
        imagesLoaded( grid ).on( 'progress', function() {
        // layout Masonry after each image loads
        msnry.layout();
        });
    })
    
    
    onMount(() => {
        console.log('grid', grid)
        getImages()
    })


    function sendFile(e) {
        submitting = true

        imageFile = e.target.files[0]
        console.log('file', imageFile)
        if (imageFile.size / 1000000 > 10) {
            Swal.fire({
                text: 'Maximum ukuran file yang diijinkan adalah 10MB',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#3984fb'
            })
            
            imageFile = null
            submitting = false
            return
        }

        if ( imageFile.type !== 'image/jpeg' && imageFile.type !== 'image/png' ) {
            Swal.fire({
                text: 'Jenis file yang diijinkan adalah jpg, jpeg, dan png',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#3984fb'
            })

            imageFile = null
            submitting = false
            return
        }

        const fileType = imageFile.type.split('/')

        const filename = 'product_' + sessionStorage.id_pendaftar + '_' + Date.now() + '.' + fileType[1]
        
        uploadImageStart(0, filename, 1)
    }

    function uploadImageStart(start, filename, part) {
        if (imageFile === null) {
            Swal.fire({
                title: 'Unggah file gagal!',
                text: 'Silakan unggah file kembali.',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#3984fb'
            })
            submitting = false
            return
        }
        console.log('size of image', imageFile.size)
        const sliceSize = 1000 * 1024 /* 1 Kibibytes */
        const nextSlice = start + sliceSize + 1
        const numberOfParts = Math.ceil(imageFile.size / sliceSize)
        const blob = imageFile.slice(start, nextSlice)
        const reader = new FileReader
        const body = new FormData
        // console.log('upload imageStart', (Math.ceil(part / numberOfParts) * 100) + '%' )

        
        reader.onload = (e) => {
            body.append('image', e.target.result)
            body.append('filename', filename)
            body.append('part', part)
            body.append('number_of_parts', numberOfParts)
            
            console.log('upload imageStart', `part = ${part}, numberofPart = ${numberOfParts}` )

            fetch(baseUrl + 'product-gallery/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, {
                method: 'POST',
                body
            })
            .then(response => response.json())
            .then(data => {
                if (data.result == 'completed') {
                    submitting = false
                    progress = '0%'
                    getImages()
                    imageFile = null
                    return
                } else if (data.result == 'too big') {
                    Swal.fire({
                        text: 'Maximum ukuran file yang diijinkan adalah 10MB',
                        icon: 'error',
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#3984fb'
                    })
                    
                    imageFile = null
                    submitting = false
                    return
                }

                uploadImageStart(nextSlice, filename, part + 1)
                progress = Math.ceil( (part / numberOfParts) * 100 ) + '%'
            })
            .catch(err => {
                submitting = false
                imageFile = null
                progress = 0
                return
            })
            
        }

        reader.readAsDataURL(blob)

    }

    function updateTitle(image) {
        const body = new FormData
        body.append('title', image.title)
        body.append('id', image.id)

        fetch(baseUrl + 'product-gallery-update/' + image.id + '/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            console.log('update title', data)
        })
    }

    function Del(id) {
        fetch(baseUrl + 'product-gallery-delete/' + id + '/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, {
            method: 'POST'
        })
        .then(response => {
            if (response.status === 200) {
                getImages()
            }
        })
    }

</script>
<div class="p-2 w-full lg:col-span-3 lg:-mt-3">
    <div class="mason-grid" id="mason-grid" bind:this="{grid}">
        <div class="mason-grid-sizer"></div>

        {#each images as image}
        <div class="mason-grid-item border mb-1">
            <img class="w-full" alt="masonry" src="{baseUrl}display-product-image/{image.id}/{sessionStorage.salt}/{sessionStorage.id_pendaftar}" />
            <div class="border flex items-center justify-between">
                <input type="text" class="w-full flex-grow p-2 text-sm" placeholder="Judul ..." bind:value="{image.title}" on:change="{e => updateTitle(image)}">
                <div class="p-2">
                    <div class="min-w-min cursor-pointer" on:click="{() => Del(image.id)}">
                        <XIcon elClass="w-5 h-5 text-red-500 lg:w-8 h-8"/>
                    </div>
                </div>
            </div>
        </div>
        {/each}
    </div>
    
        
    {#if submitting}
    <div class="border rounded-full w-full">
        <div class="p-2 rounded-full bg-blue-300 text-white text-center text-xs" style="width:{progress}">{progress}</div>
    </div>
    {/if}

    <div class="mt-8 px-4 flex justify-end">
        <button class="{submitting ? 'hidden':''}  py-1 px-2 lg:px-3 rounded-full bg-white border border-blue-300 text-blue-500 text-xs md:text-sm lg:font-medium flex items-center active:bg-blue-500 active:text-white" on:click="{() => uploadProduct.click()}"><PlusCircle elClass="w-5 h-5 lg:w-7 h-7"/> Upload</button>
        <input type="file" class="hidden" accept=".jpg,.jpeg,.png" bind:this="{uploadProduct}" on:input="{sendFile}">
    </div>
</div>

<style>
    * { box-sizing: border-box; }

    /* ---- mason-grid ---- */

    .mason-grid {
    background: #FFF;
    }

    /* clear fix */
    .mason-grid:after {
    content: '';
    display: block;
    clear: both;
    }

    /* ---- .mason-grid-item ---- */

    .mason-grid-sizer,
    .mason-grid-item {
    width: 100%;
    }

    .mason-grid-item {
    float: left;
    }

    @media (min-width: 768px){
        .mason-grid-sizer,
        .mason-grid-item {
        width: 50%;
        }

    }
    @media (min-width: 1024px) {
        .mason-grid-sizer,
        .mason-grid-item {
        width: 33.333%;
        }
    }

</style>