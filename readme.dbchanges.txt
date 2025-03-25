//for changes in the district_id
-delete school and blocks table first then execute.....
ALTER TABLE districts DROP CONSTRAINT districts_pkey;
ALTER TABLE districts ALTER COLUMN district_id TYPE VARCHAR(10);
ALTER TABLE districts ADD PRIMARY KEY (district_id);

//populating the districts table

INSERT INTO public.districts (district_id, district_name) VALUES
('OD-01', 'Angul'),
('OD-02', 'Balasore'),
('OD-03', 'Bargarh'),
('OD-04', 'Bhadrak'),
('OD-05', 'Boudh'),
('OD-06', 'Bolangir'),
('OD-07', 'Cuttack'),
('OD-08', 'Debagarh'),
('OD-09', 'Dhenkanal'),
('OD-10', 'Gajapati'),
('OD-11', 'Ganjam'),
('OD-12', 'Jagatsinghpur'),
('OD-13', 'Jajapur'),
('OD-14', 'Jharsuguda'),
('OD-15', 'Kalahandi'),
('OD-16', 'Kandhamal'),
('OD-17', 'Kendrapara'),
('OD-18', 'Keonjhar'),
('OD-19', 'Khordha'),
('OD-20', 'Koraput'),
('OD-21', 'Malkangiri'),
('OD-22', 'Mayurbhanj'),
('OD-23', 'Nabarangpur'),
('OD-24', 'Nayagarh'),
('OD-25', 'Nuapada'),
('OD-26', 'Puri'),
('OD-27', 'Rayagada'),
('OD-28', 'Sambalpur'),
('OD-29', 'Subarnapur'),
('OD-30', 'Sundargarh')
ON CONFLICT (district_id) DO NOTHING;


//populating blocks table
INSERT INTO blocks (block_id, block_name, district_id) VALUES
    -- OD-01: Angul
    (1, 'Angul', 'OD-01'),
    (2, 'Banarpal', 'OD-01'),
    (3, 'Chhendiapada', 'OD-01'),
    (4, 'Athamallik', 'OD-01'),
    (5, 'Kisshorenagar', 'OD-01'),
    (6, 'Talcher', 'OD-01'),
    (7, 'Kaniha', 'OD-01'),
    (8, 'Pallahara', 'OD-01'),

    -- OD-02: Balasore
    (9, 'Balasore', 'OD-02'),
    (10, 'Basta', 'OD-02'),
    (11, 'Remuna', 'OD-02'),
    (12, 'Jaleswar', 'OD-02'),
    (13, 'Bhograi', 'OD-02'),
    (14, 'Baliapal', 'OD-02'),
    (15, 'Nilagiri', 'OD-02'),
    (16, 'Oupada', 'OD-02'),
    (17, 'Sora', 'OD-02'),
    (18, 'Bahanaga', 'OD-02'),
    (19, 'Simulia', 'OD-02'),
    (20, 'Khaira', 'OD-02'),

    -- OD-03: Bargarh
    (21, 'Bargarh', 'OD-03'),
    (22, 'Barpali', 'OD-03'),
    (23, 'Bheden', 'OD-03'),
    (24, 'Bhatli', 'OD-03'),
    (25, 'Ambabhona', 'OD-03'),
    (26, 'Atabira', 'OD-03'),
    (27, 'Padampur', 'OD-03'),
    (28, 'Paikmal', 'OD-03'),
    (29, 'Jharbandh', 'OD-03'),
    (30, 'Sohella', 'OD-03'),
    (31, 'Bijepur', 'OD-03'),

    -- OD-04: Bhadrak
    (32, 'Bhadrak', 'OD-04'),
    (33, 'Basudevpur', 'OD-04'),
    (34, 'Bhandaripokhari', 'OD-04'),
    (35, 'Bonth', 'OD-04'),
    (36, 'Chandabali', 'OD-04'),
    (37, 'Dhamanagar', 'OD-04'),
    (38, 'Tihidi', 'OD-04'),

    -- OD-05: Bolangir
    (39, 'Bolangir', 'OD-05'),
    (40, 'Deogam', 'OD-05'),
    (41, 'Gudvella', 'OD-05'),
    (42, 'Puintala', 'OD-05'),
    (43, 'Luisinga', 'OD-05'),
    (44, 'Agalapur', 'OD-05'),
    (45, 'Titilagarh', 'OD-05'),
    (46, 'Saintala', 'OD-05'),
    (47, 'Bangamunda', 'OD-05'),
    (48, 'Muribahal', 'OD-05'),
    (49, 'Turekela', 'OD-05'),
    (50, 'Patnagarh', 'OD-05'),
    (51, 'Belapada', 'OD-05'),
    (52, 'Khaprakhole', 'OD-05'),

    -- OD-06: Boudh
    (53, 'Boudh', 'OD-06'),
    (54, 'Harbhanga', 'OD-06'),
    (55, 'Kantamal', 'OD-06'),

    -- OD-07: Cuttack
    (56, 'Cuttack', 'OD-07'),
    (57, 'Cuttack Sadar', 'OD-07'),
    (58, 'Baranga', 'OD-07'),
    (59, 'Niali', 'OD-07'),
    (60, 'Kantapada', 'OD-07'),
    (61, 'Salepur', 'OD-07'),
    (62, 'Nischintakoili', 'OD-07'),
    (63, 'Mahanga', 'OD-07'),
    (64, 'Tangi-Choudwar', 'OD-07'),
    (65, 'Athagarh', 'OD-07'),
    (66, 'Tigiria', 'OD-07'),
    (67, 'Baramba', 'OD-07'),
    (68, 'Narasinghpur', 'OD-07'),
    (69, 'Banki', 'OD-07'),
    (70, 'Banki-Dampada', 'OD-07'),

    -- OD-08: Deogarh
    (71, 'Deogarh', 'OD-08'),
    (72, 'Barkote', 'OD-08'),
    (73, 'Reamal', 'OD-08'),
    (74, 'Tileibani', 'OD-08'),

    -- OD-09: Dhenkanal
    (75, 'Dhenkanal', 'OD-09'),
    (76, 'Dhenkanal Sadar', 'OD-09'),
    (77, 'Gondia', 'OD-09'),
    (78, 'Odapada', 'OD-09'),
    (79, 'Hindol', 'OD-09'),
    (80, 'Kamakhyanagar', 'OD-09'),
    (81, 'Parjang', 'OD-09'),
    (82, 'Kankadahad', 'OD-09'),
    (83, 'Bhuban', 'OD-09'),

    -- OD-10: Gajapati
    (84, 'Gajapati', 'OD-10'),
    (85, 'Paralakhemundi', 'OD-10'),
    (86, 'Kasinagar', 'OD-10'),
    (87, 'Gumma', 'OD-10'),
    (88, 'Mohana', 'OD-10'),
    (89, 'Nuagada', 'OD-10'),
    (90, 'R.Udayagiri', 'OD-10')

ON CONFLICT (block_id) DO NOTHING;

INSERT INTO blocks (block_id, block_name, district_id) VALUES
    -- OD-11: Ganjam
    (91, 'Ganjam', 'OD-11'),
    (92, 'Chikiti', 'OD-11'),
    (93, 'Rangeilunda', 'OD-11'),
    (94, 'Digapahandi', 'OD-11'),
    (95, 'Sanakhemundi', 'OD-11'),
    (96, 'Kukudakhandi', 'OD-11'),
    (97, 'Chatrapur', 'OD-11'),
    (98, 'Purusottampur', 'OD-11'),
    (99, 'Hinjilikatu', 'OD-11'),
    (100, 'Khallikote', 'OD-11'),
    (101, 'Beguniapada', 'OD-11'),
    (102, 'Kabisuryanagar', 'OD-11'),
    (103, 'Polsara', 'OD-11'),
    (104, 'Aska', 'OD-11'),
    (105, 'Sheragada', 'OD-11'),
    (106, 'Dharakote', 'OD-11'),
    (107, 'Sorada', 'OD-11'),
    (108, 'Bhanjanagar', 'OD-11'),
    (109, 'Belguntha', 'OD-11'),
    (110, 'Buguda', 'OD-11'),
    (111, 'Jagannath Prasad', 'OD-11'),

    -- OD-12: Jagatsinghpur
    (112, 'Jagatsinghpur', 'OD-12'),
    (113, 'Biridi', 'OD-12'),
    (114, 'Naugaon', 'OD-12'),
    (115, 'Balikuda', 'OD-12'),
    (116, 'Raghunathpur', 'OD-12'),
    (117, 'Tirtol', 'OD-12'),
    (118, 'Ersama', 'OD-12'),
    (119, 'Kujang', 'OD-12'),

    -- OD-13: Jajpur
    (120, 'Jajpur', 'OD-13'),
    (121, 'Dasarathpur', 'OD-13'),
    (122, 'Binjharpur', 'OD-13'),
    (123, 'Dangadi', 'OD-13'),
    (124, 'Sukinda', 'OD-13'),
    (125, 'Korei', 'OD-13'),
    (126, 'Dharmasala', 'OD-13'),
    (127, 'Barchana', 'OD-13'),
    (128, 'Rasulpur', 'OD-13'),
    (129, 'Bari', 'OD-13'),

    -- OD-14: Jharsuguda
    (130, 'Jharsuguda', 'OD-14'),
    (131, 'Kolabira', 'OD-14'),
    (132, 'Laikera', 'OD-14'),
    (133, 'Kirmira', 'OD-14'),

    -- OD-15: Kalahandi
    (134, 'Kalahandi', 'OD-15'),
    (135, 'Kesinga', 'OD-15'),
    (136, 'Jaipatna', 'OD-15'),
    (137, 'Golamunda', 'OD-15'),
    (138, 'Junagarh', 'OD-15'),
    (139, 'Lanjigarh', 'OD-15'),
    (140, 'Narala', 'OD-15'),
    (141, 'Thuamul Rampur', 'OD-15'),

    -- OD-16: Kandhamal
    (142, 'Kandhamal', 'OD-16'),
    (143, 'Phulbani', 'OD-16'),
    (144, 'Baliguda', 'OD-16'),
    (145, 'Raikia', 'OD-16'),
    (146, 'Tumudibandh', 'OD-16'),
    (147, 'Daringbadi', 'OD-16'),
    (148, 'Kottagarh', 'OD-16'),
    (149, 'G.Udayagiri', 'OD-16'),

    -- OD-17: Kendrapara
    (150, 'Kendrapara', 'OD-17'),
    (151, 'Derabish', 'OD-17'),
    (152, 'Mahakalapada', 'OD-17'),
    (153, 'Marsaghai', 'OD-17'),
    (154, 'Rajkanika', 'OD-17'),
    (155, 'Rajnagar', 'OD-17'),
    (156, 'Garadpur', 'OD-17'),
    (157, 'Pattamundai', 'OD-17'),

    -- OD-18: Keonjhar
    (158, 'Keonjhar', 'OD-18'),
    (159, 'Anandapur', 'OD-18'),
    (160, 'Patna', 'OD-18'),
    (161, 'Ghasipura', 'OD-18'),
    (162, 'Telkoi', 'OD-18'),
    (163, 'Ghatgaon', 'OD-18'),

    -- OD-19: Khordha
    (164, 'Khordha', 'OD-19'),
    (165, 'Bhubaneswar', 'OD-19'),
    (166, 'Jatni', 'OD-19'),
    (167, 'Balipatna', 'OD-19'),
    (168, 'Balianta', 'OD-19'),
    (169, 'Tangi', 'OD-19'),
    (170, 'Chilika', 'OD-19'),
    (171, 'Banapur', 'OD-19'),

    -- OD-20: Koraput
    (172, 'Koraput', 'OD-20'),
    (173, 'Jeypore', 'OD-20'),
    (174, 'Pottangi', 'OD-20'),
    (175, 'Boipariguda', 'OD-20'),
    (176, 'Nandapur', 'OD-20'),
    (177, 'Dasamantapur', 'OD-20'),
    (178, 'Lamtaput', 'OD-20'),
    (179, 'Narayanpatna', 'OD-20'),

    -- OD-21: Malkangiri
    (180, 'Malkangiri', 'OD-21'),
    (181, 'Korukonda', 'OD-21'),
    (182, 'Mathili', 'OD-21'),
    (183, 'Kalimela', 'OD-21'),
    (184, 'Podia', 'OD-21'),
    (185, 'Motu', 'OD-21'),

    -- OD-22: Mayurbhanj
    (186, 'Mayurbhanj', 'OD-22'),
    (187, 'Baripada', 'OD-22'),
    (188, 'Bahalda', 'OD-22'),
    (189, 'Bamanghati', 'OD-22'),
    (190, 'Jashipur', 'OD-22'),
    (191, 'Karanjia', 'OD-22'),
    (192, 'Kaptipada', 'OD-22'),
    (193, 'Udala', 'OD-22'),
    (194, 'Rairangpur', 'OD-22')

ON CONFLICT (block_id) DO NOTHING;

INSERT INTO blocks (block_id, block_name, district_id) VALUES
    -- OD-23: Nabarangpur
    (195, 'Nabarangpur', 'OD-23'),
    (196, 'Nandahandi', 'OD-23'),
    (197, 'Tentulikhunti', 'OD-23'),
    (198, 'Papadahandi', 'OD-23'),
    (199, 'Kosagumuda', 'OD-23'),
    (200, 'Dabugaon', 'OD-23'),
    (201, 'Umerkote', 'OD-23'),
    (202, 'Jharigaon', 'OD-23'),
    (203, 'Chandahandi', 'OD-23'),
    (204, 'Raighar', 'OD-23'),

    -- OD-24: Nayagarh
    (205, 'Nayagarh', 'OD-24'),
    (206, 'Khandapada', 'OD-24'),
    (207, 'Gania', 'OD-24'),
    (208, 'Dasapalla', 'OD-24'),
    (209, 'Odagaon', 'OD-24'),
    (210, 'Nuagaon', 'OD-24'),
    (211, 'Bhapur', 'OD-24'),
    
    -- OD-25: Nuapada
    (212, 'Nuapada', 'OD-25'),
    (213, 'Khariar', 'OD-25'),
    (214, 'Boden', 'OD-25'),
    (215, 'Komna', 'OD-25'),
    (216, 'Sinapali', 'OD-25'),

    -- OD-26: Puri
    (217, 'Puri', 'OD-26'),
    (218, 'Brahmagiri', 'OD-26'),
    (219, 'Krushnaprasad', 'OD-26'),
    (220, 'Satyabadi', 'OD-26'),
    (221, 'Kanas', 'OD-26'),
    (222, 'Delang', 'OD-26'),
    (223, 'Pipili', 'OD-26'),
    (224, 'Nimapada', 'OD-26'),
    (225, 'Gop', 'OD-26'),
    (226, 'Kakatpur', 'OD-26'),
    (227, 'Astarang', 'OD-26'),

    -- OD-27: Rayagada
    (228, 'Rayagada', 'OD-27'),
    (229, 'Gunupur', 'OD-27'),
    (230, 'Padmapur', 'OD-27'),
    (231, 'Ramanaguda', 'OD-27'),
    (232, 'Gudari', 'OD-27'),
    (233, 'Muniguda', 'OD-27'),
    (234, 'Bisam-Cuttack', 'OD-27'),

    -- OD-28: Sambalpur
    (235, 'Sambalpur', 'OD-28'),
    (236, 'Dhankauda', 'OD-28'),
    (237, 'Maneswar', 'OD-28'),
    (238, 'Jujumora', 'OD-28'),
    (239, 'Rengali', 'OD-28'),
    (240, 'Rairakhol', 'OD-28'),
    (241, 'Naktideul', 'OD-28'),
    (242, 'Kuchinda', 'OD-28'),
    (243, 'Bamara', 'OD-28'),
    (244, 'Jamankira', 'OD-28'),

    -- OD-29: Subarnapur
    (245, 'Subarnapur', 'OD-29'),
    (246, 'Tarva', 'OD-29'),
    (247, 'Birmaharajpur', 'OD-29'),
    (248, 'Ulunda', 'OD-29'),
    (249, 'Dunguripalli', 'OD-29'),
    (250, 'Binka', 'OD-29'),

    -- OD-30: Sundargarh
    (251, 'Sundargarh', 'OD-30'),
    (252, 'Balisankara', 'OD-30'),
    (253, 'Subdega', 'OD-30'),
    (254, 'Lephripara', 'OD-30'),
    (255, 'Hemgiri', 'OD-30'),
    (256, 'Tangarapalli', 'OD-30'),
    (257, 'Rajgangpur', 'OD-30'),
    (258, 'Kutra', 'OD-30'),
    (259, 'Badagaon', 'OD-30'),
    (260, 'Lathikata', 'OD-30'),
    (261, 'Nuagaon', 'OD-30'),
    (262, 'Kuanrmunda', 'OD-30'),
    (263, 'Bisra', 'OD-30'),
    (264, 'Gurundia', 'OD-30'),
    (265, 'Koira', 'OD-30'),
    (266, 'Lahunipada', 'OD-30'),
    (267, 'Banaigarh', 'OD-30')

ON CONFLICT (block_id) DO NOTHING;


//populating complainant category

INSERT INTO complainant_category(category_name) VALUES ('Student'),
('Teacher'),
('Guardian'),
('Student Management Committee'),
('Student Management Development Committee);

-delete table grievances and grievances_category

-run node grievances.model.js
-run node grievance_category.model.js

INSERT INTO grievance_category (grievance_category_id, grievance_category_name) VALUES
('GCI-01', '25% Reserve'),
('GCI-02', 'Access'),
('GCI-03', 'Accident'),
('GCI-04', 'Additional Class Room'),
('GCI-05', 'Admission'),
('GCI-06', 'Ama Vidyalaya'),
('GCI-07', 'Bicycle'),
('GCI-08', 'Buildingless School'),
('GCI-09', 'Caste/Religion'),
('GCI-10', 'Chief Minister Medhavruti'),
('GCI-11', 'Child Marriage'),
('GCI-12', 'Children with special needs'),
('GCI-13', 'Civil Works'),
('GCI-14', 'Closure of Schools'),
('GCI-15', 'Co-Curricular Activities'),
('GCI-16', 'Computer Aided Learning'),
('GCI-17', 'Corporal Punishment'),
('GCI-18', 'Depression'),
('GCI-19', 'Double Engagement'),
('GCI-20', 'Dress Code'),
('GCI-21', 'Drinking Water'),
('GCI-22', 'Exam'),
('GCI-23', 'Fake Enrollment'),
('GCI-24', 'Fake Signature'),
('GCI-25', 'Handing over Charges'),
('GCI-26', 'Harassment to Children'),
('GCI-27', 'Hostel'),
('GCI-28', 'HSC'),
('GCI-29', 'Kitchen'),
('GCI-30', 'Mid-Day-Meal'),
('GCI-31', 'Miscellaneous'),
('GCI-32', 'Misuse of School Building'),
('GCI-33', 'Mo School'),
('GCI-34', 'Negligence on Duties'),
('GCI-35', 'Private Tuition'),
('GCI-36', 'Proxy Teacher Working'),
('GCI-37', 'Scholarship - Banishree'),
('GCI-38', 'Scholarship - NMMS'),
('GCI-39', 'Scholarship - NRTS'),
('GCI-40', 'Scholarship - Pathani Samanta'),
('GCI-41', 'Scholarship - Post Matric'),
('GCI-42', 'Scholarship - Pre Matric'),
('GCI-43', 'Scholarship - Prerana'),
('GCI-44', 'Scholarship - Primary (Merit)'),
('GCI-45', 'Scholarship - U.P (Merit)'),
('GCI-46', 'School Consolidation'),
('GCI-47', 'School Environment'),
('GCI-48', 'School Management Committee'),
('GCI-49', 'Sexual abuse'),
('GCI-50', 'Shortage of Books'),
('GCI-51', 'Shortage of Teacher'),
('GCI-52', 'Sports'),
('GCI-53', 'Taking Wine'),
('GCI-54', 'Teacher Absenteeism'),
('GCI-55', 'Teacher Apathy to Parents'),
('GCI-56', 'Teacher Apathy to Students'),
('GCI-57', 'Teaching not good'),
('GCI-58', 'Text Book'),
('GCI-59', 'Toilet'),
('GCI-60', 'Transfer'),
('GCI-61', 'Transfer Certificate'),
('GCI-62', 'Ujjwal/Utthan'),
('GCI-63', 'Unauthorised Collection'),
('GCI-64', 'Uniform/Shoes'),
('GCI-65', 'Utilisation of Grants'),
('GCI-66', 'YouTube Class');


