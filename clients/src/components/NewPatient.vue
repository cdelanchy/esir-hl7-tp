<template>
  <div class="patients">
    <h1>Add Patient</h1>
      <div class="form">
        <div>
        <label for="file">Choose a HL7 file:</label>
          <input type="file"
            id="file" name="file" ref="file" v-on:change="processFile()">
        </div>
        <div>
          <button class="app_patient_btn" @click="addPatient">Add</button>
        </div>
      </div>
  </div>
</template>

<script>
import PostsService from '@/services/PostsService'
export default {
  name: 'NewPatient',
  data () {
    return {
      file: ''
    }
  },
  methods: {
    async addPatient () {
      let formData = new FormData();
      formData.append('file', this.file);

      const result = await PostsService.sendFile(formData)

      this.$notify({
        group: 'app',
        title: 'A propos de votre message HL7...',
        type: result.type,
        text: result.message,
        duration: 10000,
      });

      this.$router.push({ name: 'Patients' })
    },
    processFile() {
      this.file = this.$refs.file.files[0];
      
    }
  }
}
</script>
<style type="text/css">
.form input, .form textarea {
  width: 500px;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
}
.form div {
  margin: 20px;
}
.app_post_btn {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  width: 520px;
  border: none;
  cursor: pointer;
}
</style>
