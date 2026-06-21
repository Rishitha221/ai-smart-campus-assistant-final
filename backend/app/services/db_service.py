from app.models import db, User, CampusInfo

def seed_database():
    """
    Seeds the database with default Campus chatbot information
    and default Admin/Student accounts if the database is empty.
    """
    try:
        # 1. Seed Default Users
        admin_exists = User.query.filter_by(username='admin').first()
        if not admin_exists:
            admin_user = User(
                username='admin',
                email='admin@campus.edu',
                role='admin',
                full_name='Campus Admin Manager',
                department='Administration'
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            print("[Database Seeder] Created default admin: admin / admin123")
            
        student_exists = User.query.filter_by(username='student').first()
        if not student_exists:
            student_user = User(
                username='student',
                email='student@campus.edu',
                role='student',
                full_name='Alex Rivera',
                department='Computer Science'
            )
            student_user.set_password('student123')
            db.session.add(student_user)
            print("[Database Seeder] Created default student: student / student123")
            
        # 2. Seed Chatbot Campus Information
        info_count = CampusInfo.query.count()
        if info_count == 0:
            default_info = [
                CampusInfo(
                    category="courses",
                    question_keywords="course, branch, degree, btech, be, mechanical, civil, computer science, electronics, engineering",
                    answer_content="AI Smart Campus offers undergraduate (B.Tech) programs in Computer Science & Engineering (CSE), "
                                   "Electronics & Communication (ECE), Electrical & Electronics (EEE), Mechanical (ME), and Civil Engineering (CE). "
                                   "We also offer postgraduate M.Tech programs in software engineering and VLSI systems. Admission is based on state "
                                   "counseling and merit tests."
                ),
                CampusInfo(
                    category="fees",
                    question_keywords="fee, cost, charge, tuition, scholarship, payment, installments, price",
                    answer_content="The tuition fee structure is as follows:\n"
                                   "- B.Tech (Merit Quota): $1,500 per annum\n"
                                   "- B.Tech (Management Quota): $3,000 per annum\n"
                                   "- M.Tech Programs: $2,000 per annum\n"
                                   "Scholarships are awarded to students scoring above 90% in examinations or based on financial need. "
                                   "Fees can be paid in two equal installments per semester at the Accounts Office."
                ),
                CampusInfo(
                    category="exams",
                    question_keywords="exam, test, internal, end-semester, timetable, date sheet, schedule, results, grades, gpa",
                    answer_content="Our academic calendar features three Internal Assessments (IA-1, IA-2, IA-3) per semester, followed by "
                                   "the End-Semester University Examinations. Midterm exams start in the 8th week of the semester, and finals start in the "
                                   "16th week. timetables are released 2 weeks prior on the official notice board. A minimum of 75% attendance in each "
                                   "subject is mandatory to sit for exams."
                ),
                CampusInfo(
                    category="placements",
                    question_keywords="placement, recruit, job, company, placement cell, internship, salary, package, offer, hire",
                    answer_content="The Training and Placement Cell coordinates campus recruitment. Key highlights:\n"
                                   "- Over 90% placement rate for eligible CSE/ECE students.\n"
                                   "- Top recruiters include Microsoft, Infosys, Accenture, TCS, Wipro, and Cognizant.\n"
                                   "- Average salary package: $8,500 per annum; Highest package last year: $42,000 per annum.\n"
                                   "- Internships are mandatory in the 6th/7th semester, facilitated by the college cell."
                ),
                CampusInfo(
                    category="library",
                    question_keywords="library, book, borrow, journal, return, card, read, study room, online library, library timing",
                    answer_content="The Central Library houses over 50,000 reference books, journals, and digital media resources. "
                                   "Hours: 8:00 AM to 8:00 PM (Monday-Friday) and 9:00 AM to 4:00 PM (Saturdays).\n"
                                   "Rules: Students can borrow up to 4 books for 14 days. A fine of $0.10/day applies to late returns. "
                                   "Digital access is available for IEEE, Springer, and ACM journals via the library Wi-Fi portal."
                ),
                CampusInfo(
                    category="facilities",
                    question_keywords="facility, canteen, hostel, sports, gym, wifi, campus, medical, transport, bus, parking",
                    answer_content="Our campus is equipped with modern facilities:\n"
                                   "- Hostels: Separate, fully furnished hostels for boys and girls with 24/7 security and clean messes.\n"
                                   "- Cafeteria: Offers a variety of healthy vegetarian and non-vegetarian food options.\n"
                                   "- Sports: Football field, cricket ground, basketball courts, and an indoor table tennis arena.\n"
                                   "- Wi-Fi: 1 Gbps high-speed Wi-Fi covers the entire campus academic blocks.\n"
                                   "- Medical: An on-campus clinic with a full-time nurse and weekly doctor visits.\n"
                                   "- Transport: A fleet of college buses operating across the city."
                )
            ]
            
            for info in default_info:
                db.session.add(info)
            print("[Database Seeder] Seeded default campus info database.")
            
        db.session.commit()
        print("[Database Seeder] Seeding completed successfully.")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"[Database Seeder Error] Failed to seed database: {e}")
        return False
