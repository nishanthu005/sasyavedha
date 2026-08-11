const locationData = {
  "Andhra Pradesh": {
    districts: ["Visakhapatnam","Vijayawada","Guntur","Kurnool","Tirupati","Nellore","Kakinada","Rajahmundry","Eluru","Ongole","Anantapur","Kadapa","Srikakulam","Vizianagaram","Chittoor"],
    seasons: ["Kharif","Rabi","Zaid"],
    defaultCrop: "Rice",
  },
  "Arunachal Pradesh": {
    districts: ["Itanagar","Tawang","Ziro","Pasighat","Bomdila","Naharlagun","Roing","Tezu","Aalo","Changlang"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Assam": {
    districts: ["Guwahati","Dibrugarh","Jorhat","Silchar","Tezpur","Nagaon","Tinsukia","Dhubri","Barpeta","Sivasagar","Karimganj","Lakhimpur","Goalpara","Kamrup","Sonitpur"],
    seasons: ["Kharif","Rabi","Boro"],
    defaultCrop: "Rice",
  },
  "Bihar": {
    districts: ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Ara","Begusarai","Katihar","Munger","Chapra","Sitamarhi","Saharsa","Hajipur","Bettiah"],
    seasons: ["Kharif","Rabi","Zaid"],
    defaultCrop: "Wheat",
  },
  "Chhattisgarh": {
    districts: ["Raipur","Bhilai","Bilaspur","Korba","Raigarh","Jagdalpur","Rajnandgaon","Durg","Ambikapur","Dhamtari","Mahasamund","Kanker","Kawardha","Kondagaon","Balod"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Goa": {
    districts: ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim","Curchorem","Sanquelim","Cuncolim","Quepem"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Gujarat": {
    districts: ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Junagadh","Gandhinagar","Anand","Mehsana","Surendranagar","Amreli","Bharuch","Navsari","Valsad"],
    seasons: ["Kharif","Rabi","Summer"],
    defaultCrop: "Cotton",
  },
  "Haryana": {
    districts: ["Ambala","Hisar","Rohtak","Karnal","Panipat","Sonipat","Faridabad","Gurugram","Yamunanagar","Sirsa","Bhiwani","Jhajjar","Jind","Kaithal","Kurukshetra"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Wheat",
  },
  "Himachal Pradesh": {
    districts: ["Shimla","Dharamshala","Mandi","Solan","Kullu","Hamirpur","Una","Bilaspur","Chamba","Kangra","Kinnaur","Lahaul & Spiti","Sirmaur","Nahan","Palampur"],
    seasons: ["Kharif","Rabi","Zaid"],
    defaultCrop: "Wheat",
  },
  "Jharkhand": {
    districts: ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Hazaribagh","Deoghar","Giridih","Ramgarh","Chaibasa","Dumka","Palamu","Gumla","Simdega","Khunti","Lohardaga"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Karnataka": {
    districts: ["Bengaluru","Mysuru","Hubli-Dharwad","Mangaluru","Belagavi","Kalaburagi","Vijayapura","Ballari","Shivamogga","Tumakuru","Raichur","Bidar","Hassan","Davangere","Chitradurga","Udupi","Kodagu","Chikkamagaluru","Mandya","Bagalkot"],
    seasons: ["Kharif","Rabi","Summer"],
    defaultCrop: "Maize",
  },
  "Kerala": {
    districts: ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Malappuram","Kottayam","Kannur","Kasaragod","Idukki","Pathanamthitta","Wayanad","Ernakulam"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Madhya Pradesh": {
    districts: ["Bhopal","Indore","Gwalior","Jabalpur","Ujjain","Sagar","Dewas","Satna","Ratlam","Rewa","Murwara","Singrauli","Burhanpur","Khandwa","Bhind","Chhindwara","Vidisha","Harda","Balaghat","Shivpuri"],
    seasons: ["Kharif","Rabi","Zaid"],
    defaultCrop: "Soybean",
  },
  "Maharashtra": {
    districts: ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Kolhapur","Amravati","Nanded","Sangli","Satara","Latur","Ahmednagar","Jalgaon","Akola","Osmanabad","Parbhani","Buldhana","Yavatmal","Wardha"],
    seasons: ["Kharif","Rabi","Summer"],
    defaultCrop: "Cotton",
  },
  "Manipur": {
    districts: ["Imphal","Churachandpur","Thoubal","Bishnupur","Senapati","Ukhrul","Chandel","Tamenglong","Kakching","Kamjong"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Meghalaya": {
    districts: ["Shillong","Tura","Jowai","Nongpoh","Baghmara","Williamnagar","Resubelpara","Nongstoin","Ampati","Mairang"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Mizoram": {
    districts: ["Aizawl","Lunglei","Saiha","Champhai","Kolasib","Serchhip","Lawngtlai","Mamit","Khawzawl","Saitual"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Maize",
  },
  "Nagaland": {
    districts: ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunheboto","Phek","Mon","Kiphire","Longleng"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Odisha": {
    districts: ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Puri","Balasore","Bhadrak","Baripada","Jharsuguda","Koraput","Rayagada","Phulbani","Bolangir","Kendrapara"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Rice",
  },
  "Punjab": {
    districts: ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Hoshiarpur","Mohali","Firozpur","Gurdaspur","Faridkot","Moga","Pathankot","Sangrur","Barnala","Mansa"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Wheat",
  },
  "Rajasthan": {
    districts: ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Bharatpur","Sikar","Sri Ganganagar","Pali","Nagaur","Tonk","Churu","Barmer","Jaisalmer","Jhalawar","Dungarpur","Banswara"],
    seasons: ["Kharif","Rabi","Zaid"],
    defaultCrop: "Wheat",
  },
  "Sikkim": {
    districts: ["Gangtok","Namchi","Gyalshing","Mangan","Pakyong","Ravangla","Jorethang","Singtam","Rangpo","Soreng"],
    seasons: ["Kharif","Rabi"],
    defaultCrop: "Maize",
  },
  "Tamil Nadu": {
    districts: ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Erode","Vellore","Dindigul","Thanjavur","Tiruppur","Ranipet","Krishnagiri","Dharmapuri","Nagapattinam","Cuddalore","Villupuram","Ramanathapuram","Virudhunagar","Karur"],
    seasons: ["Kharif","Rabi","Summer"],
    defaultCrop: "Rice",
  },
  "Telangana": {
    districts: ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Mahbubnagar","Nalgonda","Adilabad","Medak","Rangareddy","Sangareddy","Vikarabad","Suryapet","Siddipet","Jagtial"],
    seasons: ["Kharif","Rabi","Zaid"],
    defaultCrop: "Rice",
  },
  "Tripura": {
    districts: ["Agartala","Udaipur","Dharmanagar","Kailasahar","Belonia","Ambassa","Khowai","Sabroom","Sonamura","Bishalgarh"],
    seasons: ["Kharif","Rabi","Boro"],
    defaultCrop: "Rice",
  },
  "Uttar Pradesh": {
    districts: ["Lucknow","Kanpur","Agra","Varanasi","Allahabad","Meerut","Bareilly","Aligarh","Moradabad","Gorakhpur","Saharanpur","Faizabad","Mathura","Muzaffarnagar","Ghaziabad","Noida","Bulandshahr","Shahjahanpur","Jhansi","Sultanpur"],
    seasons: ["Kharif","Rabi","Zaid"],
    defaultCrop: "Wheat",
  },
  "Uttarakhand": {
    districts: ["Dehradun","Haridwar","Nainital","Roorkee","Haldwani","Rudrapur","Rishikesh","Kashipur","Mussoorie","Pithoragarh","Almora","Tehri","Pauri","Chamoli","Uttarkashi"],
    seasons: ["Kharif","Rabi","Zaid"],
    defaultCrop: "Wheat",
  },
  "West Bengal": {
    districts: ["Kolkata","Howrah","Durgapur","Asansol","Siliguri","Bardhaman","Malda","Murshidabad","Nadia","North 24 Parganas","South 24 Parganas","Hooghly","Bankura","Purulia","Jalpaiguri","Cooch Behar","Darjeeling","Alipurduar","Kalimpong","Jhargram"],
    seasons: ["Kharif","Rabi","Boro"],
    defaultCrop: "Rice",
  },
};

export default locationData;
