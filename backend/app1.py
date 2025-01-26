from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import mysql.connector
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = ''
app.config['MAIL_PASSWORD'] = ''
mail = Mail(app)
# MySQL Configuration
def get_db_connection(company_name):
    try:
        return mysql.connector.connect(
            host="",
            user="",
            password="",
            database=company_name
        )
    except mysql.connector.Error as e:
        raise Exception(f"Error connecting to the database: {str(e)}")

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    # First, we need to determine which company database to connect to
    # This could be done by having a master database with company information
    # For this example, we'll assume the company name is sent with the login request
    if not data or 'company_name' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    company_name = data['company_name']
    conn = None
    cursor = None
    try:
        conn = get_db_connection(company_name)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM t_employee_data WHERE email = %s", (data['email'],))
        employee = cursor.fetchone()
        
        if employee and employee['password'] == data['password']:  # Use plain text password comparison
            return jsonify({
                'employeeId': employee['employee_id'],
                'email': employee['email'],
                'firstName': employee['first_name'],
                'lastName': employee['last_name'],
                'designation': employee['designation'],
                'location': employee['location'],
                'compId': employee['comp_id'],
                'companyName': company_name,
                'message': 'Login successful'
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except mysql.connector.Error as e:
        # Handling database related errors
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        # Handling other types of exceptions
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/profile/<string:company_name>/<string:employee_id>', methods=['GET'])
def get_profile(company_name, employee_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT e.*, p.* 
            FROM t_employee_data e 
            LEFT JOIN profiles p ON e.employee_id = p.employee_id 
            WHERE e.employee_id = %s
        """, (employee_id,))
        
        profile = cursor.fetchone()
        if profile:
            # Convert JSON strings to Python objects
            if profile.get('skills'):
                profile['skills'] = json.loads(profile['skills'])
            if profile.get('education'):
                profile['education'] = json.loads(profile['education'])
            return jsonify(profile), 200
        else:
            return jsonify({'error': 'Profile not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/profile/<string:company_name>/<string:employee_id>', methods=['PUT'])
def update_profile(company_name, employee_id):
    data = request.json
    
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if the row exists
        cursor.execute("SELECT * FROM profiles WHERE employee_id = %s", (employee_id,))
        existing_profile = cursor.fetchone()
        
        if existing_profile:
            # Update existing row
            cursor.execute("""
                UPDATE profiles 
                SET mobile_number = %s, department = %s, project_summary = %s, work_experience = %s
                WHERE employee_id = %s
            """, (data.get('mobileNumber'), data.get('department'), 
                  data.get('projectSummary'), data.get('workExperience'), employee_id))
        else:
            # Insert new row
            cursor.execute("""
                INSERT INTO profiles (employee_id, mobile_number, department, project_summary, work_experience)
                VALUES (%s, %s, %s, %s, %s)
            """, (employee_id, data.get('mobileNumber'), data.get('department'), 
                  data.get('projectSummary'), data.get('workExperience')))
        
        conn.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/company-jobs/<string:company_name>', methods=['GET'])
def get_company_jobs(company_name):
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM t_jobs WHERE comp_id = (SELECT comp_id FROM t_company)")
        jobs = cursor.fetchall()
        return jsonify(jobs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/candidate-applications/<string:company_name>/<string:employee_id>', methods=['GET'])
def get_candidate_applications(company_name, employee_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    
    try:
        # First, get the employee's email
        cursor.execute("SELECT email FROM t_employee_data WHERE employee_id = %s", (employee_id,))
        employee = cursor.fetchone()
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        employee_email = employee['email']
        
        # Fetch applications from t_applications
        # cursor.execute("""
        #     SELECT a.*, j.job_title, c.comp_name 
        #     FROM t_applications a
        #     JOIN t_jobs j ON a.job_id = j.job_id
        #     JOIN t_company c ON j.comp_id = c.comp_id
        #     WHERE a.employee_id = %s
        # """, (employee_id,))
        # applications = cursor.fetchall()
        
        # Fetch promoted jobs from t_promote where the employee's email is in candidate_emails
        cursor.execute("""
            SELECT p.*, c.comp_name
            FROM t_promote p
            JOIN t_company c ON p.comp_id = c.comp_id
            WHERE JSON_CONTAINS(p.candidate_emails, JSON_OBJECT('email', %s))
        """, (employee_email,))
        promoted_jobs = cursor.fetchall()
        
        # Combine the results
        all_applications = promoted_jobs
        
        # Process the results to ensure consistent structure
        processed_applications = []
        for job in promoted_jobs:
            processed_job = {
                'job_id': job['job_id'],
                'job_title': job['job_title'],
                'job_description': job['job_description'],
                'job_location': job['job_location'],
                'additional_info': job['additional_info'],
                'comp_name': job['comp_name'],
                'department': job.get('department'),
                'status': 'Invited',  # Default status for promoted jobs
                'application_date': job['created_at'].isoformat() if job['created_at'] else None,
                'psy_questions': job['psy_questions'],
                'case_study_questions': job['case_study_questions'],
                'gd_data': job['gd_data'],
                'mbti_data': job['mbti_data']
            }
            processed_applications.append(processed_job)
        
        return jsonify(processed_applications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/upload-resume/<string:company_name>/<string:employee_id>', methods=['POST'])
def upload_resume(company_name, employee_id):
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{employee_id}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        conn = get_db_connection(company_name)
        cursor = conn.cursor()
        try:
            # Check if the row exists
            cursor.execute("SELECT * FROM profiles WHERE employee_id = %s", (employee_id,))
            existing_profile = cursor.fetchone()
            
            if existing_profile:
                # Update existing row
                cursor.execute("UPDATE profiles SET resume_path = %s WHERE employee_id = %s", (filename, employee_id))
            else:
                # Insert new row
                cursor.execute("INSERT INTO profiles (employee_id, resume_path) VALUES (%s, %s)", (employee_id, filename))
            
            conn.commit()
            return jsonify({'message': 'Resume uploaded successfully', 'filename': filename}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/delete-resume/<string:company_name>/<string:employee_id>', methods=['DELETE'])
def delete_resume(company_name, employee_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT resume_path FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        if result and result[0]:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], result[0])
            if os.path.exists(file_path):
                os.remove(file_path)
            cursor.execute("UPDATE profiles SET resume_path = NULL WHERE employee_id = %s", (employee_id,))
            conn.commit()
            return jsonify({'message': 'Resume deleted successfully'}), 200
        return jsonify({'message': 'No resume found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/profile/<string:company_name>/<string:employee_id>/education', methods=['PUT'])
def update_education(company_name, employee_id):
    data = request.json
    conn = get_db_connection(company_name)
    cursor = conn.cursor()
    try:
        education_json = json.dumps(data)
        
        # Check if the row exists
        cursor.execute("SELECT * FROM profiles WHERE employee_id = %s", (employee_id,))
        existing_profile = cursor.fetchone()
        
        if existing_profile:
            # Update existing row
            cursor.execute("UPDATE profiles SET education = %s WHERE employee_id = %s", (education_json, employee_id))
        else:
            # Insert new row
            cursor.execute("INSERT INTO profiles (employee_id, education) VALUES (%s, %s)", (employee_id, education_json))
        
        conn.commit()
        return jsonify({'message': 'Education updated successfully', 'education': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/profile/<string:company_name>/<string:employee_id>/skills', methods=['PUT'])
def update_skills(company_name, employee_id):
    data = request.json
    conn = get_db_connection(company_name)
    cursor = conn.cursor()
    try:
        skills_json = json.dumps(data['skills'])
        
        # Check if the row exists
        cursor.execute("SELECT * FROM profiles WHERE employee_id = %s", (employee_id,))
        existing_profile = cursor.fetchone()
        
        if existing_profile:
            # Update existing row
            cursor.execute("UPDATE profiles SET skills = %s WHERE employee_id = %s", (skills_json, employee_id))
        else:
            # Insert new row
            cursor.execute("INSERT INTO profiles (employee_id, skills) VALUES (%s, %s)", (employee_id, skills_json))
        
        conn.commit()
        return jsonify({'message': 'Skills updated successfully', 'skills': data['skills']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/view-resume/<string:company_name>/<string:employee_id>', methods=['GET'])
def view_resume(company_name, employee_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT resume_path FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        if result and result['resume_path']:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], result['resume_path'])
            return send_file(file_path, as_attachment=True)
        return jsonify({'error': 'Resume not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notifications/<string:company_name>/<string:employee_id>', methods=['GET'])
def get_notifications(company_name, employee_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Fetch job application notifications
        cursor.execute("""
            SELECT 'job_application' as type, 'New Job Application' as title,
                   CONCAT('You have been invited to apply for the position of ', job_title) as message,
                   created_at as timestamp
            FROM t_promote
            WHERE JSON_CONTAINS(candidate_emails, JSON_OBJECT('email', (SELECT email FROM t_employee_data WHERE employee_id = %s)))
            AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        """, (employee_id,))
        job_notifications = cursor.fetchall()

        # Fetch profile completion notifications
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN mobile_number IS NULL THEN 'profile_completion'
                    WHEN department IS NULL THEN 'profile_completion'
                    WHEN project_summary IS NULL THEN 'profile_completion'
                    WHEN work_experience IS NULL THEN 'profile_completion'
                    WHEN skills IS NULL OR JSON_LENGTH(skills) = 0 THEN 'skills_update'
                    WHEN education IS NULL OR JSON_LENGTH(education) = 0 THEN 'education_update'
                    WHEN resume_path IS NULL THEN 'resume_upload'
                    ELSE NULL
                END as type,
                CASE 
                    WHEN mobile_number IS NULL THEN 'Complete Your Profile'
                    WHEN department IS NULL THEN 'Complete Your Profile'
                    WHEN project_summary IS NULL THEN 'Complete Your Profile'
                    WHEN work_experience IS NULL THEN 'Complete Your Profile'
                    WHEN skills IS NULL OR JSON_LENGTH(skills) = 0 THEN 'Update Your Skills'
                    WHEN education IS NULL OR JSON_LENGTH(education) = 0 THEN 'Update Your Education'
                    WHEN resume_path IS NULL THEN 'Upload Your Resume'
                    ELSE NULL
                END as title,
                CASE 
                    WHEN mobile_number IS NULL THEN 'Please add your mobile number to complete your profile.'
                    WHEN department IS NULL THEN 'Please add your department to complete your profile.'
                    WHEN project_summary IS NULL THEN 'Please add a project summary to complete your profile.'
                    WHEN work_experience IS NULL THEN 'Please add your work experience to complete your profile.'
                    WHEN skills IS NULL OR JSON_LENGTH(skills) = 0 THEN 'Add your key skills to improve your job matches.'
                    WHEN education IS NULL OR JSON_LENGTH(education) = 0 THEN 'Add your education details to complete your profile.'
                    WHEN resume_path IS NULL THEN 'Upload your resume to apply for jobs more easily.'
                    ELSE NULL
                END as message,
                NOW() as timestamp
            FROM profiles
            WHERE employee_id = %s
        """, (employee_id,))
        profile_notifications = cursor.fetchall()

        # Combine and sort all notifications
        all_notifications = job_notifications + profile_notifications
        all_notifications = [n for n in all_notifications if n['type'] is not None]
        all_notifications.sort(key=lambda x: x['timestamp'], reverse=True)

        return jsonify(all_notifications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/achievements/<string:company_name>/<string:employee_id>', methods=['GET'])
def get_achievements(company_name, employee_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT achievements, certificates
            FROM profiles
            WHERE employee_id = %s
        """, (employee_id,))
        
        result = cursor.fetchone()
        if result:
            achievements = json.loads(result['achievements']) if result['achievements'] else []
            certificates = json.loads(result['certificates']) if result['certificates'] else []
            return jsonify({
                'achievements': achievements,
                'certificates': certificates
            }), 200
        else:
            return jsonify({'error': 'Profile not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/achievements/<string:company_name>/<string:employee_id>', methods=['POST'])
def add_achievement(company_name, employee_id):
    data = request.json
    conn = get_db_connection(company_name)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT achievements FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        
        if result:
            current_achievements = json.loads(result[0]) if result[0] else []
        else:
            current_achievements = []
        
        new_achievement = {
            'id': len(current_achievements) + 1,
            'title': data['title'],
            'description': data['description'],
            'date': data['date'],
            'quarter': data['quarter']
        }
        
        current_achievements.append(new_achievement)
        
        cursor.execute("""
            UPDATE profiles
            SET achievements = %s
            WHERE employee_id = %s
        """, (json.dumps(current_achievements), employee_id))
        
        conn.commit()
        return jsonify({'message': 'Achievement added successfully', 'achievement': new_achievement}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/achievements/<string:company_name>/<string:employee_id>/<int:achievement_id>', methods=['PUT'])
def update_achievement(company_name, employee_id, achievement_id):
    data = request.json
    conn = get_db_connection(company_name)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT achievements FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        
        if result:
            current_achievements = json.loads(result[0]) if result[0] else []
        else:
            return jsonify({'error': 'Profile not found'}), 404
        
        achievement_index = next((index for (index, d) in enumerate(current_achievements) if d["id"] == achievement_id), None)
        
        if achievement_index is not None:
            current_achievements[achievement_index] = {
                'id': achievement_id,
                'title': data['title'],
                'description': data['description'],
                'date': data['date'],
                'quarter': data['quarter']
            }
            
            cursor.execute("""
                UPDATE profiles
                SET achievements = %s
                WHERE employee_id = %s
            """, (json.dumps(current_achievements), employee_id))
            
            conn.commit()
            return jsonify({'message': 'Achievement updated successfully', 'achievement': current_achievements[achievement_index]}), 200
        else:
            return jsonify({'error': 'Achievement not found'}), 404
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/achievements/<string:company_name>/<string:employee_id>/<int:achievement_id>', methods=['DELETE'])
def delete_achievement(company_name, employee_id, achievement_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT achievements FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        
        if result:
            current_achievements = json.loads(result[0]) if result[0] else []
        else:
            return jsonify({'error': 'Profile not found'}), 404
        
        current_achievements = [ach for ach in current_achievements if ach['id'] != achievement_id]
        
        cursor.execute("""
            UPDATE profiles
            SET achievements = %s
            WHERE employee_id = %s
        """, (json.dumps(current_achievements), employee_id))
        
        conn.commit()
        return jsonify({'message': 'Achievement deleted successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/certificates/<string:company_name>/<string:employee_id>', methods=['POST'])
def upload_certificate(company_name, employee_id):
    if 'certificate' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['certificate']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{employee_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        conn = get_db_connection(company_name)
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT certificates FROM profiles WHERE employee_id = %s", (employee_id,))
            result = cursor.fetchone()
            
            if result:
                current_certificates = json.loads(result[0]) if result[0] else []
            else:
                current_certificates = []
            
            new_certificate = {
                'id': len(current_certificates) + 1,
                'filename': filename,
                'upload_date': datetime.now().isoformat()
            }
            
            current_certificates.append(new_certificate)
            
            cursor.execute("""
                UPDATE profiles
                SET certificates = %s
                WHERE employee_id = %s
            """, (json.dumps(current_certificates), employee_id))
            
            conn.commit()
            return jsonify({'message': 'Certificate uploaded successfully', 'certificate': new_certificate}), 200
        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/certificates/<string:company_name>/<string:employee_id>/<int:certificate_id>', methods=['DELETE'])
def delete_certificate(company_name, employee_id, certificate_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT certificates FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        
        if result:
            current_certificates = json.loads(result[0]) if result[0] else []
        else:
            return jsonify({'error': 'Profile not found'}), 404
        
        certificate_to_delete = next((cert for cert in current_certificates if cert['id'] == certificate_id), None)
        
        if certificate_to_delete:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], certificate_to_delete['filename'])
            if os.path.exists(file_path):
                os.remove(file_path)
            
            current_certificates = [cert for cert in current_certificates if cert['id'] != certificate_id]
            
            cursor.execute("""
                UPDATE profiles
                SET certificates = %s
                WHERE employee_id = %s
            """, (json.dumps(current_certificates), employee_id))
            
            conn.commit()
            return jsonify({'message': 'Certificate deleted successfully'}), 200
        else:
            return jsonify({'error': 'Certificate not found'}), 404
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/certificates/<string:company_name>/<string:employee_id>/<int:certificate_id>', methods=['GET'])
def view_certificate(company_name, employee_id, certificate_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT certificates FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        
        if result:
            certificates = json.loads(result['certificates']) if result['certificates'] else []
            certificate = next((cert for cert in certificates if cert['id'] == certificate_id), None)
            
            if certificate:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], certificate['filename'])
                if os.path.exists(file_path):
                    return send_file(file_path)
                else:
                    return jsonify({'error': 'Certificate file not found'}), 404
            else:
                return jsonify({'error': 'Certificate not found'}), 404
        else:
            return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/leave-requests/<company_name>/<employee_id>', methods=['GET', 'POST'])
def leave_requests(company_name, employee_id):
    conn = get_db_connection(company_name)
    cur = conn.cursor()

    if request.method == 'GET':
        cur.execute("SELECT leave_requests FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cur.fetchone()
        
        if result:
            leave_requests = json.loads(result[0]) if result[0] else []
            return jsonify(leave_requests)
        else:
            return jsonify([])

    elif request.method == 'POST':
        data = request.json
        start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
        end_date = datetime.strptime(data['endDate'], '%Y-%m-%d')
        leave_type = data['leaveType']
        reason = data['reason']

        # Get current leave balance
        cur.execute("SELECT leave_balance FROM t_employee_data WHERE employee_id = %s", (employee_id,))
        leave_balance_result = cur.fetchone()
        if not leave_balance_result:
            return jsonify({"error": "Employee not found"}), 404
        leave_balance = json.loads(leave_balance_result[0])

        # Calculate number of days
        num_days = (end_date - start_date).days + 1

        # Check if enough leave balance is available
        if leave_balance[leave_type]['remaining'] < num_days:
            return jsonify({"error": "Insufficient leave balance"}), 400

        # Update leave balance
        leave_balance[leave_type]['used'] += num_days
        leave_balance[leave_type]['remaining'] -= num_days

        # Update t_employee_data
        cur.execute("UPDATE t_employee_data SET leave_balance = %s WHERE employee_id = %s",
                    (json.dumps(leave_balance), employee_id))

        # Get current leave requests
        cur.execute("SELECT leave_requests FROM profiles WHERE employee_id = %s", (employee_id,))
        current_requests_result = cur.fetchone()
        current_requests = json.loads(current_requests_result[0]) if current_requests_result and current_requests_result[0] else []

        # Add new leave request
        new_request = {
            "startDate": data['startDate'],
            "endDate": data['endDate'],
            "leaveType": leave_type,
            "reason": reason,
            "status": "Pending",
            "requestDate": datetime.now().isoformat()
        }
        current_requests.append(new_request)

        # Update profiles table
        cur.execute("UPDATE profiles SET leave_requests = %s WHERE employee_id = %s",
                    (json.dumps(current_requests), employee_id))

        conn.commit()

        # Send email to manager
        # cur.execute("SELECT manager_id FROM t_employee_data WHERE employee_id = %s", (employee_id,))
        # manager_id_result = cur.fetchone()
        # if manager_id_result:
            # manager_id = manager_id_result[0]
        cur.execute("SELECT manager_email FROM t_employee_data WHERE employee_id = %s", (employee_id,))
        manager_email_result = cur.fetchone()
        if manager_email_result:
            manager_email = manager_email_result[0]
            msg = Message("New Leave Request",
                            sender="your-email@example.com",
                            recipients=[manager_email])
            msg.body = f"Employee {employee_id} has requested {leave_type} leave from {data['startDate']} to {data['endDate']}."
            mail.send(msg)

        cur.close()
        conn.close()

        return jsonify({"message": "Leave request submitted successfully"}), 201

@app.route('/api/leave-balance/<company_name>/<employee_id>', methods=['GET'])
def get_leave_balance(company_name, employee_id):
    conn = get_db_connection(company_name)
    cur = conn.cursor()

    cur.execute("SELECT leave_balance FROM t_employee_data WHERE employee_id = %s", (employee_id,))
    result = cur.fetchone()

    cur.close()
    conn.close()

    if result:
        return jsonify(json.loads(result[0]))
    else:
        return jsonify({"error": "Employee not found"}), 404
 
@app.route('/api/termination-request/<string:company_name>/<string:employee_id>', methods=['POST'])
def submit_termination_request(company_name, employee_id):
    data = request.json
    conn = get_db_connection(company_name)
    cursor = conn.cursor()
    
    try:
        # Check if there's an existing termination request
        cursor.execute("SELECT termination_request FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        
        if result and result[0]:
            return jsonify({'error': 'A termination request already exists'}), 400
        
        termination_request = {
            'reason': data['reason'],
            'reason_category': data['reasonCategory'],
            'last_working_date': data['lastWorkingDate'],
            'notice_period': data['noticePeriod'],
            'handover_notes': data['handoverNotes'],
            'status': 'Pending',
            'request_date': datetime.now().isoformat()
        }
        
        cursor.execute("""
            UPDATE profiles
            SET termination_request = %s
            WHERE employee_id = %s
        """, (json.dumps(termination_request), employee_id))
        
        # Fetch manager's email
        cursor.execute("SELECT manager_email FROM t_employee_data WHERE employee_id = %s", (employee_id,))
        manager_email = cursor.fetchone()[0]
        
        # Send email to manager
        msg = Message("New Termination Request",
                      sender=app.config['MAIL_USERNAME'],
                      recipients=[manager_email])
        msg.body = f"Employee {employee_id} has submitted a termination request. Please review it in the management portal."
        mail.send(msg)
        
        conn.commit()
        return jsonify({'message': 'Termination request submitted successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/termination-request/<string:company_name>/<string:employee_id>', methods=['GET'])
def get_termination_request(company_name, employee_id):
    conn = get_db_connection(company_name)
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT termination_request FROM profiles WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        
        if result and result['termination_request']:
            termination_data = json.loads(result['termination_request'])
            # Ensure all required fields are present
            return jsonify({
                'status': termination_data.get('status', 'Pending'),
                'reason_category': termination_data.get('reason_category', ''),
                'reason': termination_data.get('reason', ''),
                'last_working_date': termination_data.get('last_working_date', ''),
                'notice_period': termination_data.get('notice_period', 'Standard (30 days)'),
                'request_date': termination_data.get('request_date', '')
            }), 200
        else:
            return jsonify({'message': 'No termination request found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)