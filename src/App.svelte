<script>
	import { Router, Route } from 'svelte-routing'

    import Heading from '@/components/Heading.svelte'
    import Footer from '@/components/Footer.svelte'


	import Biodata from '@/sections/Biodata.svelte'
	import EduAchievement from '@/sections/EduAchievement.svelte'
	import Experiences from '@/sections/Experiences.svelte'
	import BusinessProfile from '@/sections/BusinessProfile.svelte'

	
	function authorizing() {
		if ( !sessionStorage.salt || !sessionStorage.id_pendaftar ) {
			// location.href = "/"
		}

		const formData = new FormData
		formData.append('salt', sessionStorage.salt)
		formData.append('id_pendaftar', sessionStorage.id_pendaftar)

		fetch('https://sentra.test/api/camp-bcic/verify-registrant', {
			method: 'POST',
			body: formData
		})
		.then(response => {
			console.log('response', response)
			if ( response.status !== 200 ) {
				// sessionStorage.clear()
				// location.href = "/"
			}
		})
	}
	authorizing()

	let url = ''
	const baseUrl = 'https://sentra.test/api/camp-bcic/'
</script>

<div class="px-0 md:px-20 xl:max-w-screen-xl xl:mx-auto xl:px-24">

	<Heading/>

	<Router url={url}>
		
		<Route path="/biodata">
			<Biodata {baseUrl}/>
		</Route>

		<Route path="/pendidikan-dan-pencapaian">
			<EduAchievement {baseUrl}/>
		</Route>

		<Route path="/pengalaman-kerja-dan-organisasi">
			<Experiences {baseUrl}/>
		</Route>

		<Route path="/profil-usaha">
			<BusinessProfile {baseUrl}/>
		</Route>

	</Router>

</div>

<Footer/>


<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>