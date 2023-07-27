
import io
import random
import shutil
import string
from flask import Flask, json, request, jsonify, send_file
from flask_cors import CORS, cross_origin
from ffmpeg_streaming import Formats
from PIL import Image
import ffmpeg_streaming
import jwt
from datetime import datetime, timedelta
import base64
import cv2
import threading
import subprocess
import bcrypt
import psutil
import os
import time
import sys
from conn import create_conn

def create_app(test_config = None):
    app = Flask(__name__)
    app.config['SECRET_KEY'] = '123'
    
    CORS(app)
    app.config['CORS_ORIGINS'] = ['http://localhost:3000']
    app.config['CORS_METHODS'] = ['GET', 'POST', 'OPTIONS']
    app.config['CORS_HEADERS'] = ['Content-Type']

# function section
    # use to gen new video name for store in db
    def genFileName(name):
        ran_text = os.urandom(8).hex()
        name += ran_text
        random.seed(name)
        characters = string.ascii_letters + string.digits
        new_name = ''.join(random.choices(characters, k=12))
        encode = new_name
        return encode
    
    def monitor(ffmpeg, duration, time_, time_left, process, encode):
        last_per = -1
        
        per = int(round(time_ / duration * 100))
        if per % 10 == 0 and per != 0 and per != last_per:
            updateVidData(per, encode)
            last_per = per
        # sys.stdout.write(
        #     "\rTranscoding...(%s%%) %s left [%s%s]" %
        #     (per, timedelta(seconds=int(time_left)), '#' * per, '-' * (100 - per))
        # )
        # sys.stdout.flush()
    
    def updateVidData(per, encode):

        if(type(per) == int):
            per = str(per) + '%'

        conn = create_conn()

        cursor = conn.cursor()
        cursor.execute('UPDATE videos SET V_permit=%s WHERE V_encode = %s',
                       (per, encode ))
        conn.commit()
        cursor.close()
        conn.close()

    def insertVidData(data):
        try:
            path = '../upload/'+ data.get('path') + '/' + data.get('encode')
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO videos (V_title, V_view, V_length, V_size, V_pic, U_id, V_permit, V_encode, V_quality, V_desc) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
                (data.get('videoName'), 0, data.get('videoDuration'), data.get('videoSize'), data.get('videoThumbnail'), data.get('videoOwner'), '0%', data.get('encode'), data.get('height'), data.get('videoDesc'))
            )
            
            for tag in data.get('tags'):
                cursor.execute(
                    'INSERT INTO tag_video (V_ID, T_ID) VALUES ((SELECT V_ID FROM videos WHERE V_encode = %s ), %s) '
                    ,(data.get('encode'), tag['T_ID'])
                )

            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print('error:', e)
            shutil.rmtree(path)
    
    def convert(path, vidData):
        # print(vidData.get('height'))
        try:
            print('convert' + path)
            
            if(vidData.get('videoThumbnail') == '' or vidData.get('videoThumbnail') == None):
                b64 = getThumbnail(path)
                vidData['videoThumbnail'] = b64

            video = ffmpeg_streaming.input(path)
            # print(video)

            insertVidData(vidData)

            hls = video.hls(Formats.h264())
            hls.auto_generate_representations()
            print('convert')
            hls.output('..\\upload\\'+vidData.get('path')+'\\' + vidData.get('encode') + '\\' + vidData.get('encode') + '.m3u8',
                        monitor=lambda ffmpeg, duration, time_, time_left, process: monitor(ffmpeg, duration, time_, time_left, process, vidData['encode']))
            print('convert success')
            updateVidData(vidData['videoPermit'], vidData['encode'])
            os.remove(path)
        except Exception as e:
            print('Error:', e)
            pass

    def getThumbnail(path):
        video = cv2.VideoCapture(path)
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

        video.set(cv2.CAP_PROP_POS_FRAMES, int(frame_count*0.3))
        flag, frame = video.read()
        video.release()

        re_frame = cv2.resize(frame, (1280, 720))
        flag, img = cv2.imencode('.jpg', re_frame)
        b64_img = base64.b64encode(img.tobytes())
        return b64_img
    
    def verify(raw_token):
        if raw_token is None or not raw_token.startswith('Bearer '):
            # invalid token
            return False

        token = raw_token.split(' ')[-1]
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            return True
        except jwt.ExpiredSignatureError:
            # return jsonify({'message': 'Token has expired'}), 401
            return False
        except jwt.InvalidTokenError:
            # return jsonify({'message': 'Invalid token'}), 401
            return False

    def imgResize(file, w, h):
        # pro 400x400
        # banner 820x312
        img = Image.open(file)
        img_resize = img.resize((w, h))
        img_resize = img_resize.convert("RGB")

        buffer = io.BytesIO()
        img_resize.save(buffer, format="JPEG")
        b64 = base64.b64encode(buffer.getvalue())
        # clear buffer
        buffer.seek(0)
        buffer.truncate()
        return b64


# api section
    @app.route('/')
    def welcome():
        return "hello this is flask python"

    @app.route('/test/json', methods=['POST'])
    def testJson():
        data = request.get_json()
        print(data)
        return '', 200
        
    @app.route('/test/json/get', methods=['GET'])
    def testGetJson():
        t = request.args.get('t')
        v = request.args.get('v')
        print(t, v)
        return '', 200

    @app.route('/register', methods=['POST'])
    def register():
        try:
            # Get the data from the request
            data = request.get_json()
            # create connection
            conn = create_conn()

            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            encode_password = str(password).encode('utf-8')
            hashed_password = bcrypt.hashpw(encode_password, bcrypt.gensalt())
            file_name = genFileName(username)

            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO users (U_name, U_mail, U_pass, U_type, U_vid, U_permit, U_folder) VALUES (%s, %s, %s, %s, %s, %s, %s)',
                (username, email, hashed_password, 'user', 0, 1, file_name)
            )
            conn.commit()
            cursor.close()
            conn.close()
            
            folder_path = '../upload/'+file_name #create folder for uploaded videos
            os.makedirs(folder_path)
            return ({
                    'status': 'success',
                    'data': {}
                }), 200
        except Exception as e:
            return ({'message': 'error'}), 400
     
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()

        conn = create_conn()

        email = data.get('email')
        plain_password = data.get('password')
        check = data.get('check')

        # get password
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM users WHERE U_mail=%s',
            (email,)
        )
        # print('select success')
        data = cursor.fetchone()
        # print('get hashed')
        
        # print(hashed_password)
        if data is not None:
            hashed_password = data[3]

            if bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8')):
                conn.commit()
                cursor.close()
                conn.close()

                

                if(check == 1 or check == '1'):
                    print('1 month')
                    payload = {
                        'U_id': data[0],
                        'U_type': data[4],
                        'U_permit': data[8],
                        'exp': datetime.utcnow() + timedelta(days=30)
                    }
                else:
                    print('1 hours')
                    payload = {
                        'U_id': data[0],
                        'U_type': data[4],
                        'U_permit': data[8],
                        'exp': datetime.utcnow() + timedelta(hours=1)
                    }
                
                
                token = jwt.encode(payload , app.config['SECRET_KEY'], algorithm='HS256')

                return ({
                    'status': 'success',
                    'token': token,
                    'data': {
                        'U_id': data[0],
                        'username': data[1],
                        'email': data[2],
                        'U_type': data[4],
                        'vid': data[5],
                        'U_permit': data[8],
                        'U_folder': data[9]
                    }
                }), 200
            else:
                # print('not correct')
                conn.commit()
                cursor.close()
                conn.close()
                return ({
                    'status': 'fail',
                    'data': {}
                }), 200
        
        return ''

    @app.route('/verify', methods=['POST'])
    def verify_token():
        raw_token = request.headers.get('Authorization')

        if raw_token is None or not raw_token.startswith('Bearer '):
            return 'Invalid token', 401

        token = raw_token.split(' ')[-1]
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            # Additional verification or processing can be done here
            return jsonify(payload), 200
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

    @app.route('/insert/user/admin', methods=['POST'])
    def insertUser_admin():
        try:
            data = request.get_json()
        
            conn = create_conn()
            cursor = conn.cursor()
            for user in data:

                encode_password = str(user['U_pass']).encode('utf-8')
                hashed_password = bcrypt.hashpw(encode_password, bcrypt.gensalt())
                file_name = genFileName(user['U_name'])

                cursor.execute(
                    'INSERT INTO users (U_name, U_mail, U_pass, U_type, U_vid, U_permit, U_folder) VALUES (%s, %s, %s, %s, %s, %s, %s)',
                    (user['U_name'], user['U_mail'], hashed_password, user['U_type'], 0, user['U_permit'], file_name)
                )
                folder_path = '../upload/'+file_name #create folder for uploaded videos
                os.makedirs(folder_path)
            conn.commit()
            cursor.close()
            conn.close()
                
            return '',200
        except Exception as e:
            return ({'message': e}), 500

    @app.route('/upload', methods=['POST'])
    def upload():
        token = request.headers.get('Authorization')
        
        if(verify(token)):
            tmp = token.split(' ')[-1]
            payload = jwt.decode(tmp, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            if(payload.get('U_permit') == 1):
                file = request.files['video']
                data = request.form['data']

                vid_data = json.loads(data)
                vidName = file.filename
                new_name = genFileName(vidName.split('.')[0])

                vid_data['encode'] = new_name

                # print(vid_data)

                if file:
                    save_path = '../upload/'+ vid_data['path'] +'/'+ new_name + '.' + vid_data['videoType']
                    file.save(save_path)

                    # Wait until the file is successfully saved
                    while not os.path.exists(save_path):
                        time.sleep(1)

                    thread = threading.Thread(target=convert, args=(save_path, vid_data))
                    thread.start()
                    # convert(save_path, vid_data)
                    time.sleep(0.8)
                    return ({'message': 'upload success, converting'}), 200
                else:
                    return ({'message': 'upload/convert error'}), 500
            else:
                return ({'message': 'No Permission'}), 406
        else:
            return ({'message': 'token invalid'}), 401

    @app.route('/download', methods=['GET'])
    def download():
        video = request.args.get('v')
        user = request.args.get('u')

        video_url = 'http://localhost:80/hls/upload/'+user+'/'+video+'/'+video+'.m3u8'

        subprocess.run(['ffmpeg', '-i', video_url, 'output.mp4', '-y'])
        response = send_file('output.mp4', as_attachment=True)

        return response
    
    @app.route('/getUsers')
    def getUsers():
        conn = create_conn()

        cursor = conn.cursor()
        cursor.execute('SELECT U_id, U_name, U_mail, U_vid, U_type, U_permit FROM users')
        data = cursor.fetchall()
        conn.commit()
        cursor.close()
        conn.close()

        users = []
        for row in data:
            user = {
                'U_id': row[0],
                'U_name': row[1],
                'U_mail': row[2],
                'U_vid': row[3],
                'U_type': row[4],
                'U_permit': row[5]
            }
            users.append(user)

        return jsonify(users), 200
    
    @app.route('/getUser/id', methods=['GET'])
    def getUser():
        try:
            u_id = request.args.get('u')
            
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                'SELECT * FROM users WHERE U_ID = %s', 
                (u_id,))
            data = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            folder_name = data[9]
            folder_path = '../upload/'+folder_name
            size = 0

            for path, dirs, files in os.walk(folder_path):
                for f in files:
                    fp = os.path.join(path, f)
                    size += os.path.getsize(fp)

            size = round(size/(1048576)) # bytes to mb

            tmp = str(data[6])
            tmp2 = str(data[10])
            user = {
                'U_ID': data[0],
                'U_name': data[1],
                'U_mail': data[2],
                'U_type': data[4],
                'U_vid': data[5],
                'U_storage': size,
                'U_pro_pic': tmp[2:-1],
                'U_banner': tmp2[2:-1]
                }

            return jsonify(user), 200
        except Exception as e:
            print(e)
            return ({'message': 'Get Videos Fail'}), 500
    
    @app.route('/getVideos/public')
    def getVideos():
        try:
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                'SELECT videos.*, users.U_name, users.U_folder FROM videos, users WHERE users.U_ID = videos.U_ID AND V_permit=%s ORDER BY RAND ( ) LIMIT 10 ', 
                ('public',))
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    'V_ID': row[0],
                    'V_title': row[1],
                    'V_view': row[2],
                    'V_length': row[3],
                    'V_size': row[4],
                    'V_upload': row[5],
                    'V_pic': tmp[2:-1],
                    'U_ID': row[7],
                    'V_encode': row[9],
                    'V_quality': row[10],
                    'V_desc': row[11],
                    'U_name': row[12],
                    'U_folder': row[13]
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({'message': 'Get Videos Fail'}), 500
    
    @app.route('/get/videos/upload', methods=['GET'])
    def getVideosUpload():
        try:
            U_id = request.args.get('u')
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                'SELECT V_pic, V_encode, V_title, V_permit FROM videos WHERE V_permit NOT IN (%s, %s, %s) AND U_ID = %s', 
                ('public', 'private', 'unlisted', U_id))
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[0])
                video = {
                    'V_pic': tmp[2:-1],
                    'V_encode': row[1],
                    'V_title': row[2],
                    'V_permit': row[3]
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({'message': 'Get Videos Fail'}), 500

    @app.route('/get/videos/tag', methods=['GET'])
    def getVideos_tag():
        try:
            data = request.args.get('tag')
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                'SELECT videos.*, users.U_name, users.U_folder \
                FROM videos, users \
                WHERE users.U_ID = videos.U_ID \
                AND V_permit=%s AND videos.V_ID IN ( \
                SELECT V_ID FROM tag_video WHERE T_ID = (\
                    SELECT T_ID FROM tags WHERE T_name = %s)) \
                ORDER BY V_upload DESC LIMIT 10', 
                ('public', data))
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    'V_ID': row[0],
                    'V_title': row[1],
                    'V_view': row[2],
                    'V_length': row[3],
                    'V_size': row[4],
                    'V_upload': row[5],
                    'V_pic': tmp[2:-1],
                    'U_ID': row[7],
                    'V_encode': row[9],
                    'V_quality': row[10],
                    'V_desc': row[11],
                    'U_name': row[12],
                    'U_folder': row[13]
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({'message': 'Get Videos Fail'}), 500

    @app.route('/get/videos/search', methods=['GET'])
    def getVideos_search():
        try:
            data = request.args.get('s')
            data = '%' + data + '%'

            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute(
                'SELECT videos.*, users.U_name, users.U_folder \
                FROM videos, users \
                WHERE users.U_ID = videos.U_ID \
                AND V_permit=%s \
                AND V_title LIKE %s \
                ORDER BY V_upload DESC LIMIT 10', 
                ('public', data))
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    'V_ID': row[0],
                    'V_title': row[1],
                    'V_view': row[2],
                    'V_length': row[3],
                    'V_size': row[4],
                    'V_upload': row[5],
                    'V_pic': tmp[2:-1],
                    'U_ID': row[7],
                    'V_encode': row[9],
                    'V_quality': row[10],
                    'V_desc': row[11],
                    'U_name': row[12],
                    'U_folder': row[13]
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({'message': 'Get Videos Fail'}), 500

    @app.route('/getVideos/profile')
    def getVideosProfile():
        permit= request.args.get('p')
        user = request.args.get('u')

        try:
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                'SELECT videos.*, users.U_name, users.U_folder FROM videos, users WHERE users.U_ID = videos.U_ID AND videos.U_ID = %s AND V_permit = %s ORDER BY videos.V_upload DESC LIMIT 10 ', 
                (user, permit))
            data = cursor.fetchall()
            conn.commit()
            cursor.close()
            conn.close()

            videos = []
            for row in data:
                tmp = str(row[6])
                video = {
                    'V_ID': row[0],
                    'V_title': row[1],
                    'V_view': row[2],
                    'V_length': row[3],
                    'V_size': row[4],
                    'V_upload': row[5],
                    'V_pic': tmp[2:-1],
                    'U_ID': row[7],
                    'V_encode': row[9],
                    'V_quality': row[10],
                    'V_desc': row[11],
                    'U_name': row[12],
                    'U_folder': row[13]
                }
                videos.append(video)

            return jsonify(videos), 200
        except Exception as e:
            print(e)
            return ({'message': 'Get Videos Fail'}), 500

    @app.route('/get/video/info', methods=['GET'])
    def getVideo():
        try:
            V_encode = request.args.get('v')
            u = request.args.get('u')
            
            conn = create_conn()

            cursor = conn.cursor()
            cursor.execute(
                'SELECT v.*, u.U_name, u.U_folder, u.U_pro_pic, COALESCE(h.H_watchTime, 0) AS H_watchTime \
                FROM videos AS v  \
                JOIN users AS u ON u.U_ID = v.U_ID \
                LEFT JOIN histories AS h ON h.U_ID = %s AND h.V_ID = v.V_ID \
                WHERE u.U_ID = v.U_ID \
                AND v.V_encode = %s \
                ORDER BY h.H_watchdata DESC LIMIT 1', 
                (u, V_encode,))
            data = cursor.fetchone()

            cursor.execute(
                'SELECT * FROM tags WHERE T_ID IN \
                    (SELECT T_ID FROM tag_video WHERE V_ID = \
                        (SELECT V_ID FROM videos WHERE V_encode = %s))',
                        (V_encode,)
            )
            data2 = cursor.fetchall()

            conn.commit()
            cursor.close()
            conn.close()

            tags = []
            for row in data2:
                tag = {
                    'T_ID': row[0],
                    'T_name': row[1]
                }
                tags.append(tag)

            tmp = str(data[6])
            tmp2 = str(data[14])
            video = {
                'V_ID': data[0],
                'V_title': data[1],
                'V_view': data[2],
                'V_length': data[3],
                'V_size': data[4],
                'V_upload': data[5],
                'V_pic': tmp[2:-1],
                'U_ID': data[7],
                'V_permit': data[8],
                'V_encode': data[9],
                'V_quality': data[10],
                'V_desc': data[11],
                'U_name': data[12],
                'U_folder': data[13],
                'U_pro_pic': tmp2[2:-1],
                'watchTime': data[15],
                'tags': tags
                }

            return jsonify(video), 200
        except Exception as e:
            print(e)
            return ({'message': 'Get Videos Fail'}), 500

    @app.route('/getPermit', methods=['GET'])
    def getPermit():
        U_id = request.args.get('id')

        conn = create_conn()

        cursor = conn.cursor()
        cursor.execute('SELECT U_type, U_permit FROM users WHERE U_id=%s', (U_id,))
        data = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        return ({
            'status': 'success',
            'data': {
                'U_type': data[0],
                'U_permit': data[1]
            }
        }), 200
    
    @app.route('/update/user/user', methods=['POST'])
    def updateUser_User():
        token = request.headers.get('Authorization')

        if(verify(token)):
            tmp = token.split(' ')[-1]
            payload = jwt.decode(tmp, app.config['SECRET_KEY'], algorithms=['HS256'])
            tmp = request.form.get('data')
            data = json.loads(tmp)

            if(payload.get('U_id') == data['U_id']):

                
                pro = request.files.get('pro')
                banner = request.files.get('banner')
                f1, f2 = False, False

                if pro is not None : 
                    pro64 = imgResize(pro, 400, 400)
                    f1 = True

                if banner is not None :
                    banner64 = imgResize(banner, 820, 312)
                    f2 = True

                


                conn = create_conn()

                cursor = conn.cursor()
                
                if(f1 and f2):
                    cursor.execute(
                        'UPDATE users SET U_name = %s, U_mail=%s, U_pro_pic=%s, U_banner=%s WHERE U_ID = %s' 
                        ,(data['username'], data['email'], pro64, banner64, data['U_id'])
                    )

                elif (f1 and not f2):
                    cursor.execute(
                        'UPDATE users SET U_name = %s, U_mail=%s, U_pro_pic=%s WHERE U_ID = %s' 
                        ,(data['username'], data['email'], pro64, data['U_id'])
                    )

                elif (not f1 and f2):
                    cursor.execute(
                        'UPDATE users SET U_name = %s, U_mail=%s, U_banner=%s WHERE U_ID = %s' 
                        ,(data['username'], data['email'], banner64, data['U_id'])
                    )

                elif (not f1 and not f2):
                    cursor.execute(
                        'UPDATE users SET U_name = %s, U_mail=%s WHERE U_ID = %s' 
                        ,(data['username'], data['email'], data['U_id'])
                    )

                conn.commit()
                cursor.close()
                conn.close()


                return ({'message': 'success'}), 200
            else:
                return ({'message': 'no permission'})
        else:
            return ({'message': 'token invalid'}), 401

    @app.route('/update/user/admin', methods=['POST'])
    def updateUser_admin():
        token = request.headers.get('Authorization')
        
        if(verify(token)):
            tmp = token.split(' ')[-1]
            payload = jwt.decode(tmp, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            if(payload.get('U_type') == 'admin'):
                data = request.get_json()

                conn = create_conn()
                cursor = conn.cursor()

                cursor.execute(
                    'UPDATE users SET U_name=%s, U_mail=%s, U_permit=%s, U_type=%s WHERE U_ID=%s' 
                    ,(data.get('U_name'), data.get('U_mail'), data.get('U_permit'), data.get('U_type'), data.get('U_id'))
                )

                conn.commit()
                cursor.close()
                conn.close()

                return ({'message': 'success'}), 200
            else:
                print('2')
                return ({'message': 'have no permission'}), 400
        else:
            print('3')
            return ({'message': 'token invalid'}), 400

    @app.route('/update/video/user', methods=['POST'])
    def updateVideo_user():
        token = request.headers.get('Authorization')

        if(verify(token)):
            tmp = token.split(' ')[-1]
            payload = jwt.decode(tmp, app.config['SECRET_KEY'], algorithms=['HS256'])
            data = request.get_json()

            if(payload.get('U_id') == data['U_id'] or payload.get('U_type') == 'admin'):
                conn = create_conn()
                cursor = conn.cursor()
                
                cursor.execute(
                        'UPDATE videos SET V_title=%s, V_desc=%s, V_permit=%s WHERE V_encode=%s' 
                        ,(data['title'], data['desc'], data['permit'], data['encode'])
                    )
                
                cursor.execute(
                    'SELECT * FROM tag_video WHERE V_ID = %s',(data['V_id'],)
                )
                exist_data = cursor.fetchall()

                exist_row = {(row[0], row[1]) for row in exist_data}
                new_row = {(data['V_id'], row['T_ID']) for row in data['tag']}

                insert_row = new_row - exist_row
                delete_row = exist_row - new_row

                insert_q = 'INSERT INTO tag_video (V_ID, T_ID) VALUES (%s, %s)'
                delete_q = 'DELETE FROM tag_video WHERE V_ID = %s AND T_ID = %s'

                for row in insert_row:
                    cursor.execute(insert_q, row)

                for row in delete_row:
                    cursor.execute(delete_q, row)

                conn.commit()
                cursor.close()
                conn.close()


                return ({'message': 'success'}), 200
            else:
                return ({'message': 'no permission'}), 400
        else:
            return ({'message': 'token invalid'}), 401

    @app.route('/delete/video/user', methods=['POST'])
    def deleteVideo_user():
        token = request.headers.get('Authorization')

        if(verify(token)):
            tmp = token.split(' ')[-1]
            payload = jwt.decode(tmp, app.config['SECRET_KEY'], algorithms=['HS256'])
            data = request.get_json()

            if(payload.get('U_id') == data['U_id'] or payload.get('U_type') == 'admin'):
                print(data)
                conn = create_conn()
                cursor = conn.cursor()
                path = '../upload/'+ data['U_folder'] + '/' + data['V_encode']
                
                cursor.execute(
                    'DELETE FROM tag_video WHERE V_ID = \
                        (SELECT V_encode \
                        FROM videos \
                        WHERE V_encode = %s)',
                    (data['V_encode'],)
                )
                conn.commit()

                cursor.execute(
                        'DELETE FROM videos WHERE U_ID=%s AND V_encode=%s' 
                        ,(data['U_id'], data['V_encode'])
                    )

                conn.commit()
                cursor.close()
                conn.close()

                try:
                    shutil.rmtree(path)
                except OSError as e:
                    pass


                return ({'message': 'success'}), 200
            else:
                return ({'message': 'no permission'}), 400
        else:
            return ({'message': 'token invalid'}), 401

    @app.route('/insert/history', methods=['POST'])
    def insertHistory():
        data = request.get_json()
        conn = create_conn()
        cursor = conn.cursor()
                
        cursor.execute(
                'INSERT INTO histories (U_ID, V_ID, H_watchtime) \
                SELECT %s, %s, COALESCE((SELECT H_watchTime FROM histories WHERE U_ID = %s AND V_ID = %s ORDER BY H_watchData DESC LIMIT 1), 0) \
                WHERE %s != ( \
                    SELECT V_ID FROM histories \
                    WHERE U_ID = %s \
                    ORDER BY H_watchData DESC LIMIT 1) \
                    OR NOT EXISTS ( \
                        SELECT V_ID FROM histories WHERE U_ID = %s)' 
                ,(data['U_id'], data['V_id'], data['U_id'], data['V_id'], data['V_id'], data['U_id'], data['U_id'])
            )

        conn.commit()
        cursor.close()
        conn.close()
        return ({'message': 'success'}), 200

    @app.route('/update/history/user', methods=['POST'])
    @cross_origin()
    def updateHistory():
        data = request.get_json()
        conn = create_conn()
        cursor = conn.cursor()
                
        cursor.execute(
                'UPDATE histories SET H_watchtime = %s \
                WHERE U_ID = %s AND V_ID = %s AND H_watchData = ( \
                    SELECT MAX(H_watchData) \
                    FROM histories \
                    WHERE U_ID = %s AND V_ID = %s \
                )' 
                ,(data['watchTime'], data['U_id'], data['V_id'], data['U_id'], data['V_id'])
            )

        conn.commit()
        cursor.close()
        conn.close()
        return ({'message': 'success'}), 200

    @app.route('/get/histories', methods=['GET'])
    def getHistories():
        u = request.args.get('u')
        conn = create_conn()

        cursor = conn.cursor()
        cursor.execute(
            'SELECT h.H_ID, h.H_watchData, v.V_ID, v.V_title, v.V_encode, v.V_pic, u.U_ID, u.U_name, u.U_folder \
            FROM histories AS h \
            JOIN videos AS v ON v.V_ID = h.V_ID \
            JOIN users AS u ON u.U_ID = h.U_ID \
            WHERE h.U_ID = %s \
            ORDER BY h.H_watchData DESC \
            LIMIT 10'
            ,(u,)
            )
        data = cursor.fetchall()
        conn.commit()
        cursor.close()
        conn.close()

        histories = []
        for row in data:
            tmp = str(row[5])
            history = {
                'H_ID': row[0],
                'H_watchDate': row[1],
                'V_ID': row[2],
                'V_title': row[3],
                'V_encode': row[4], 
                'V_pic': tmp[2:-1],
                'U_ID': row[6],
                'U_name': row[7],
                'U_folder': row[8]
            }
            histories.append(history)

        return jsonify(histories), 200

    @app.route('/delete/histories', methods=['POST'])
    def deleteHistories():
        data = request.get_json()

        conn = create_conn()
        cursor = conn.cursor()
        cursor.execute(
            'DELETE FROM histories WHERE U_ID = %s',
            (data['user'],))
        conn.commit()
        cursor.close()
        conn.close()

        return  ({'message': 'success'}), 200
        
    @app.route('/get/histories/lastWatch', methods=['GET'])
    def getLastWatch():
        u = request.args.get('u')
        v = request.args.get('v')
        conn = create_conn()

        cursor = conn.cursor()
        cursor.execute(
            'SELECT H_watchTime \
            FROM histories \
            WHERE V_ID = %s AND U_ID = %s \
            ORDER BY H_watchdata DESC LIMIT 1'
            ,(v, u)
            )
        data = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        watch = {
            'watchTime': data[0]
        }

        return jsonify(watch), 200

    @app.route('/get/uploadLog')
    def getUploadLog():
        conn = create_conn()

        cursor = conn.cursor()
        cursor.execute('SELECT v.V_pic, v.V_title, v.V_encode, v.U_ID, u.U_name, v.V_upload, u.U_folder\
                       FROM videos AS v \
                       JOIN users AS u \
                       WHERE u.U_ID = v.U_ID \
                       ORDER BY v.V_upload DESC')
        data = cursor.fetchall()
        conn.commit()
        cursor.close()
        conn.close()

        logs = []
        for row in data:
            tmp = str(row[0])
            log = {
                'V_pic': tmp[2:-1],
                'V_title': row[1],
                'V_encode': row[2],
                'U_ID': row[3],
                'U_name': row[4],
                'V_upload': row[5],
                'U_folder': row[6]
            }
            logs.append(log)

        return jsonify(logs), 200

    @app.route('/get/tags')
    def getTag():
        conn = create_conn()

        cursor = conn.cursor()
        cursor.execute('SELECT tg.T_ID, tg.T_name, COUNT(tv.V_ID) AS count \
                       FROM tags AS tg \
                       LEFT JOIN tag_video AS tv ON tv.T_ID = tg.T_ID \
                       GROUP BY tg.T_ID, tg.T_name')
        data = cursor.fetchall()
        conn.commit()
        cursor.close()
        conn.close()

        tags = []
        for row in data:
            tag = {
                'T_ID': row[0],
                'T_name': row[1],
                'count': row[2]
            }
            tags.append(tag)

        return jsonify(tags), 200

    @app.route('/insert/tag', methods=['POST'])
    def insertNewTag():
        token = request.headers.get('Authorization')
        
        if(verify(token)):
            data = request.get_json()

            conn = create_conn()
            cursor = conn.cursor()
            
            for tag in data:
                cursor.execute('INSERT INTO tags (T_name) VALUES (%s)',(tag,))
                
            conn.commit()
            cursor.close()
            conn.close()

            return ({'message': 'success'}), 200
        
        else:
            return({'message': 'token invalid'}), 400

    @app.route('/delete/tag', methods=['GET'])
    def deleteTag():
        token = request.headers.get('Authorization')
        
        if(verify(token)):
            t = request.args.get('t')
            conn = create_conn()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM tags WHERE T_ID = %s', (t,))
            conn.commit()
            cursor.close()
            conn.close()

            return ({'message': 'success'}), 200
        else:
            return ({'message': 'token invalid'}), 400



    @app.route('/server_resource')
    def server():
        #CPU INFO
        cpu_used = psutil.cpu_percent()

        #Memory INFO [Ram Used]
        mem = psutil.virtual_memory().percent

        #Disk INFO
        disk_usage = psutil.disk_usage(os.getcwd())
        disk_total = round(disk_usage.total / (1024*1024*1024), 2)
        disk_used = round(disk_usage.used / (1024*1024*1024), 2)
        disk_free = round(disk_usage.free / (1024*1024*1024), 2)
        disk_used_percent = round(disk_usage.percent,2)

        #Network INFO
        inf = "Ethernet"
        net_stat = psutil.net_io_counters(pernic=True, nowrap=True)[inf]
        net_in_1 = net_stat.bytes_recv
        net_out_1 = net_stat.bytes_sent
        time.sleep(1)
        net_stat = psutil.net_io_counters(pernic=True, nowrap=True)[inf]
        net_in_2 = net_stat.bytes_recv
        net_out_2 = net_stat.bytes_sent

        net_in = round((net_in_2 - net_in_1) / 1024 / 1024, 3)
        net_out = round((net_out_2 - net_out_1) / 1024 / 1024, 3)

        return jsonify({'CPU_Used': str(cpu_used)+"%",
                  'Memory_Used' : str(mem)+"%",
                  'Disk_Total' : str(disk_total)+' GB',
                  'Disk_Used' : str(disk_used)+' GB',
                  'Disk_Free' : str(disk_free)+' GB',
                  'Disk_Used_Percent' : str(disk_used_percent)+'%',
                  'Network_Download' : str(net_in)+' MB/s',
                  'Network_Upload' : str(net_out)+' MB/s'}), 200
    
    
    return app
APP = create_app()

if __name__ == '__main__':
    APP.run(host='0.0.0.0', port = 8900, debug=True) 
    #APP.run(debug=True)